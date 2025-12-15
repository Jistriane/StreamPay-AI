import { expect } from "chai";
import hre from "hardhat";
const { ethers } = hre;
import type { LiquidityPool, ERC20Mock } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers.js";

describe("LiquidityPool", function () {
    let liquidityPool: LiquidityPool;
    let token0: ERC20Mock;
    let token1: ERC20Mock;
    let owner: SignerWithAddress;
    let user1: SignerWithAddress;
    let user2: SignerWithAddress;

    const INITIAL_MINT = ethers.parseEther("1000000");
    const POOL_INITIAL_LIQUIDITY_TOKEN0 = ethers.parseEther("1000");
    const POOL_INITIAL_LIQUIDITY_TOKEN1 = ethers.parseEther("1000");

    beforeEach(async function () {
        [owner, user1, user2] = await ethers.getSigners();

        // Deploy tokens
        const ERC20Mock = await ethers.getContractFactory("ERC20Mock");
        token0 = await ERC20Mock.deploy("Token0", "T0", owner.address, INITIAL_MINT);
        token1 = await ERC20Mock.deploy("Token1", "T1", owner.address, INITIAL_MINT);

        // Deploy LiquidityPool
        const LiquidityPool = await ethers.getContractFactory("LiquidityPool");
        liquidityPool = await LiquidityPool.deploy();

        // Distribuir tokens para users
        await token0.transfer(user1.address, ethers.parseEther("10000"));
        await token0.transfer(user2.address, ethers.parseEther("10000"));
        await token1.transfer(user1.address, ethers.parseEther("10000"));
        await token1.transfer(user2.address, ethers.parseEther("10000"));

        // Approvar
        await token0.connect(user1).approve(liquidityPool.target, ethers.MaxUint256);
        await token1.connect(user1).approve(liquidityPool.target, ethers.MaxUint256);
        await token0.connect(user2).approve(liquidityPool.target, ethers.MaxUint256);
        await token1.connect(user2).approve(liquidityPool.target, ethers.MaxUint256);
    });

    describe("Pool Creation", function () {
        it("Should create a new pool correctly", async function () {
            const tx = await liquidityPool
                .connect(user1)
                .createPool(
                    token0.target,
                    token1.target,
                    POOL_INITIAL_LIQUIDITY_TOKEN0,
                    POOL_INITIAL_LIQUIDITY_TOKEN1
                );

            await expect(tx).to.emit(liquidityPool, "PoolCreated");

            const poolInfo = await liquidityPool.getPoolInfo(0);
            expect(poolInfo.reserve0).to.equal(POOL_INITIAL_LIQUIDITY_TOKEN0);
            expect(poolInfo.reserve1).to.equal(POOL_INITIAL_LIQUIDITY_TOKEN1);
            expect(poolInfo.active).to.equal(true);
        });

        it("Should reject pool creation with zero amounts", async function () {
            await expect(
                liquidityPool.connect(user1).createPool(
                    token0.target,
                    token1.target,
                    0,
                    POOL_INITIAL_LIQUIDITY_TOKEN1
                )
            ).to.be.revertedWith("Amounts must be > 0");
        });

        it("Should reject pool creation with same token", async function () {
            await expect(
                liquidityPool.connect(user1).createPool(
                    token0.target,
                    token0.target,
                    POOL_INITIAL_LIQUIDITY_TOKEN0,
                    POOL_INITIAL_LIQUIDITY_TOKEN1
                )
            ).to.be.revertedWith("Tokens must be different");
        });
    });

    describe("Liquidity Management", function () {
        beforeEach(async function () {
            await liquidityPool
                .connect(user1)
                .createPool(
                    token0.target,
                    token1.target,
                    POOL_INITIAL_LIQUIDITY_TOKEN0,
                    POOL_INITIAL_LIQUIDITY_TOKEN1
                );
        });

        it("Should add liquidity to existing pool", async function () {
            const addAmount0 = ethers.parseEther("100");
            const addAmount1 = ethers.parseEther("100");

            const tx = await liquidityPool
                .connect(user2)
                .addLiquidity(0, addAmount0, addAmount1);

            await expect(tx).to.emit(liquidityPool, "LiquidityAdded");

            const poolInfo = await liquidityPool.getPoolInfo(0);
            expect(poolInfo.reserve0).to.equal(
                POOL_INITIAL_LIQUIDITY_TOKEN0 + addAmount0
            );
            expect(poolInfo.reserve1).to.equal(
                POOL_INITIAL_LIQUIDITY_TOKEN1 + addAmount1
            );
        });

        it("Should remove liquidity correctly", async function () {
            const lpPosition = await liquidityPool.getLPPosition(user1.address, 0);
            const sharesToBurn = lpPosition.shares / BigInt(2); // Queimar metade

            const tx = await liquidityPool
                .connect(user1)
                .removeLiquidity(0, sharesToBurn);

            await expect(tx).to.emit(liquidityPool, "LiquidityRemoved");

            const updatedPosition = await liquidityPool.getLPPosition(
                user1.address,
                0
            );
            expect(updatedPosition.shares).to.equal(
                lpPosition.shares - sharesToBurn
            );
        });

        it("Should reject removal of more shares than owned", async function () {
            const lpPosition = await liquidityPool.getLPPosition(user1.address, 0);

            await expect(
                liquidityPool
                    .connect(user1)
                    .removeLiquidity(0, lpPosition.shares + BigInt(1))
            ).to.be.revertedWith("Insufficient shares");
        });
    });

    describe("Swapping", function () {
        beforeEach(async function () {
            await liquidityPool
                .connect(user1)
                .createPool(
                    token0.target,
                    token1.target,
                    POOL_INITIAL_LIQUIDITY_TOKEN0,
                    POOL_INITIAL_LIQUIDITY_TOKEN1
                );
        });

        it("Should execute token0 to token1 swap", async function () {
            const amountIn = ethers.parseEther("1");
            const expectedOut = await liquidityPool.getSwapAmount(
                0,
                token0.target,
                amountIn
            );

            const tx = await liquidityPool
                .connect(user2)
                .swap(0, token0.target, amountIn, expectedOut);

            await expect(tx).to.emit(liquidityPool, "Swapped");

            const balance = await token1.balanceOf(user2.address);
            expect(balance).to.be.greaterThanOrEqual(expectedOut);
        });

        it("Should execute token1 to token0 swap", async function () {
            const amountIn = ethers.parseEther("1");
            const expectedOut = await liquidityPool.getSwapAmount(
                0,
                token1.target,
                amountIn
            );

            const tx = await liquidityPool
                .connect(user2)
                .swap(0, token1.target, amountIn, expectedOut);

            await expect(tx).to.emit(liquidityPool, "Swapped");
        });

        it("Should reject swap with excessive slippage", async function () {
            const amountIn = ethers.parseEther("1");
            const expectedOut = await liquidityPool.getSwapAmount(
                0,
                token0.target,
                amountIn
            );

            // Tentar com minAmountOut muito alto
            const excessiveMin = expectedOut + ethers.parseEther("1");

            await expect(
                liquidityPool
                    .connect(user2)
                    .swap(0, token0.target, amountIn, excessiveMin)
            ).to.be.revertedWith("Excessive slippage");
        });

        it("Should charge 0.3% fee on swaps", async function () {
            const amountIn = ethers.parseEther("100");
            await liquidityPool
                .connect(user2)
                .swap(0, token0.target, amountIn, BigInt(1));

            // Fee deve ser ~0.3% = 30 bps
            const fee0 = await liquidityPool.collectedFees0(0);
            const expectedFee = (amountIn * BigInt(30)) / BigInt(10000);

            expect(fee0).to.be.closeTo(expectedFee, ethers.parseEther("0.01"));
        });
    });

    describe("Fee Collection", function () {
        beforeEach(async function () {
            await liquidityPool
                .connect(user1)
                .createPool(
                    token0.target,
                    token1.target,
                    POOL_INITIAL_LIQUIDITY_TOKEN0,
                    POOL_INITIAL_LIQUIDITY_TOKEN1
                );

            // Execute some swaps to generate fees
            await liquidityPool
                .connect(user2)
                .swap(0, token0.target, ethers.parseEther("10"), BigInt(1));
        });

        it("Should collect pool fees", async function () {
            const initialBalance = await token0.balanceOf(owner.address);

            await liquidityPool.collectFees(0);

            const finalBalance = await token0.balanceOf(owner.address);
            expect(finalBalance).to.be.greaterThan(initialBalance);

            const fees = await liquidityPool.collectedFees0(0);
            expect(fees).to.equal(0); // Fees should be cleared
        });

        it("Should reject fee collection from non-owner", async function () {
            await expect(liquidityPool.connect(user1).collectFees(0)).to.be.revertedWith(
                "Ownable: caller is not the owner"
            );
        });
    });

    describe("Pause/Unpause", function () {
        beforeEach(async function () {
            await liquidityPool
                .connect(user1)
                .createPool(
                    token0.target,
                    token1.target,
                    POOL_INITIAL_LIQUIDITY_TOKEN0,
                    POOL_INITIAL_LIQUIDITY_TOKEN1
                );
        });

        it("Should pause pool operations", async function () {
            await liquidityPool.pause();

            await expect(
                liquidityPool.connect(user2).swap(0, token0.target, ethers.parseEther("1"), 0)
            ).to.be.revertedWith("Pausable: paused");
        });

        it("Should resume pool operations after unpause", async function () {
            await liquidityPool.pause();
            await liquidityPool.unpause();

            const tx = await liquidityPool
                .connect(user2)
                .swap(0, token0.target, ethers.parseEther("1"), 0);

            await expect(tx).to.not.be.reverted;
        });
    });
});
