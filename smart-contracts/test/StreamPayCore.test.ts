import { expect } from "chai";
import hre from "hardhat";
const { ethers } = hre;
import type { StreamPayCore, ERC20Mock } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers.js";
import { time } from "@nomicfoundation/hardhat-network-helpers";

describe("StreamPayCore", function () {
    let streamPayCore: StreamPayCore;
    let token: ERC20Mock;
    let owner: SignerWithAddress;
    let sender: SignerWithAddress;
    let recipient: SignerWithAddress;
    let other: SignerWithAddress;

    const INITIAL_MINT = ethers.parseEther("1000000");
    const STREAM_AMOUNT = ethers.parseEther("1000");
    const STREAM_DURATION = 86400; // 1 dia em segundos

    beforeEach(async function () {
        [owner, sender, recipient, other] = await ethers.getSigners();

        // Deploy token
        const ERC20Mock = await ethers.getContractFactory("ERC20Mock");
        token = await ERC20Mock.deploy("Test Token", "TT", owner.address, INITIAL_MINT);

        // Deploy StreamPayCore
        const StreamPayCore = await ethers.getContractFactory("StreamPayCore");
        streamPayCore = await StreamPayCore.deploy();

        // Distribuir tokens
        await token.transfer(sender.address, STREAM_AMOUNT);

        // Approvar
        await token
            .connect(sender)
            .approve(streamPayCore.target, ethers.MaxUint256);
    });

    describe("Stream Creation", function () {
        it("Should create a stream successfully", async function () {
            const ratePerSecond = STREAM_AMOUNT / BigInt(STREAM_DURATION);

            const tx = await streamPayCore
                .connect(sender)
                .createStream(
                    recipient.address,
                    token.target,
                    STREAM_AMOUNT,
                    ratePerSecond,
                    STREAM_DURATION
                );

            await expect(tx).to.emit(streamPayCore, "StreamCreated");

            const streamInfo = await streamPayCore.getStreamInfo(0);
            expect(streamInfo.sender).to.equal(sender.address);
            expect(streamInfo.recipient).to.equal(recipient.address);
            expect(streamInfo.token).to.equal(token.target);
            expect(streamInfo.deposit).to.equal(STREAM_AMOUNT);
            expect(streamInfo.active).to.equal(true);
        });

        it("Should reject stream to self", async function () {
            const ratePerSecond = STREAM_AMOUNT / BigInt(STREAM_DURATION);

            await expect(
                streamPayCore.connect(sender).createStream(
                    sender.address, // Self
                    token.target,
                    STREAM_AMOUNT,
                    ratePerSecond,
                    STREAM_DURATION
                )
            ).to.be.revertedWith("Cannot stream to self");
        });

        it("Should reject stream with insufficient deposit", async function () {
            const ratePerSecond = STREAM_AMOUNT / BigInt(STREAM_DURATION);
            const insufficientDeposit = ratePerSecond * BigInt(STREAM_DURATION - 100);

            await expect(
                streamPayCore.connect(sender).createStream(
                    recipient.address,
                    token.target,
                    insufficientDeposit,
                    ratePerSecond,
                    STREAM_DURATION
                )
            ).to.be.revertedWith("Insufficient deposit");
        });

        it("Should reject stream with invalid duration", async function () {
            const ratePerSecond = STREAM_AMOUNT / BigInt(STREAM_DURATION);

            await expect(
                streamPayCore.connect(sender).createStream(
                    recipient.address,
                    token.target,
                    STREAM_AMOUNT,
                    ratePerSecond,
                    0 // Zero duration
                )
            ).to.be.revertedWith("Duration must be > 0");
        });
    });

    describe("Claiming", function () {
        beforeEach(async function () {
            const ratePerSecond = STREAM_AMOUNT / BigInt(STREAM_DURATION);
            await streamPayCore
                .connect(sender)
                .createStream(
                    recipient.address,
                    token.target,
                    STREAM_AMOUNT,
                    ratePerSecond,
                    STREAM_DURATION
                );
        });

        it("Should calculate claimable amount correctly", async function () {
            // Avançar 12 horas
            await time.increase(43200);

            const claimable = await streamPayCore.availableToClaim(0);

            // Deve ser ~50% do total
            expect(claimable).to.be.closeTo(
                STREAM_AMOUNT / BigInt(2),
                ethers.parseEther("1")
            );
        });

        it("Should allow recipient to claim", async function () {
            // Avançar 12 horas (50% do stream)
            await time.increase(43200);

            const initialBalance = await token.balanceOf(recipient.address);
            const claimable = await streamPayCore.availableToClaim(0);

            const tx = await streamPayCore.connect(recipient).claim(0);

            await expect(tx).to.emit(streamPayCore, "StreamClaimed");

            const finalBalance = await token.balanceOf(recipient.address);
            // Tolerância para arredondamento e tempo de bloco
            expect(finalBalance - initialBalance).to.be.closeTo(claimable, ethers.parseEther("1"));
        });

        it("Should reject claim from non-recipient", async function () {
            await time.increase(43200);

            await expect(streamPayCore.connect(other).claim(0)).to.be.revertedWith(
                "Only recipient can claim"
            );
        });

        it("Should reject claim with nothing to claim", async function () {
            // Cancelar o stream para torná-lo inativo
            await streamPayCore.connect(sender).cancelStream(0);
            
            // Stream inativo retorna 0 para availableToClaim
            await expect(streamPayCore.connect(recipient).claim(0))
                .to.be.revertedWith("Inactive stream");
        });

        it("Should allow multiple claims", async function () {
            // Primeira claim: 25% do tempo
            await time.increase(STREAM_DURATION / 4);
            await streamPayCore.connect(recipient).claim(0);

            const balanceAfterFirst = await token.balanceOf(recipient.address);

            // Segunda claim: mais 25%
            await time.increase(STREAM_DURATION / 4);
            await streamPayCore.connect(recipient).claim(0);

            const balanceAfterSecond = await token.balanceOf(recipient.address);

            expect(balanceAfterSecond).to.be.greaterThan(balanceAfterFirst);
        });
    });

    describe("Stream Cancellation", function () {
        beforeEach(async function () {
            const ratePerSecond = STREAM_AMOUNT / BigInt(STREAM_DURATION);
            await streamPayCore
                .connect(sender)
                .createStream(
                    recipient.address,
                    token.target,
                    STREAM_AMOUNT,
                    ratePerSecond,
                    STREAM_DURATION
                );
        });

        it("Should cancel stream and distribute tokens correctly", async function () {
            // Avançar 25% do tempo
            await time.increase(STREAM_DURATION / 4);

            const recipientBalanceBefore = await token.balanceOf(recipient.address);
            const senderBalanceBefore = await token.balanceOf(sender.address);

            const tx = await streamPayCore.connect(sender).cancelStream(0);

            await expect(tx).to.emit(streamPayCore, "StreamCancelled");

            const recipientBalanceAfter = await token.balanceOf(recipient.address);
            const senderBalanceAfter = await token.balanceOf(sender.address);

            // Recipient deve receber ~25% do stream
            expect(recipientBalanceAfter).to.be.greaterThan(recipientBalanceBefore);

            // Sender deve receber o restante (~75%)
            expect(senderBalanceAfter).to.be.greaterThan(senderBalanceBefore);
        });

        it("Should reject cancellation from non-sender", async function () {
            await expect(streamPayCore.connect(recipient).cancelStream(0))
                .to.be.revertedWith("Only sender can cancel");
        });

        it("Should reject cancellation of inactive stream", async function () {
            await streamPayCore.connect(sender).cancelStream(0);

            // Tentar cancelar novamente
            await expect(streamPayCore.connect(sender).cancelStream(0))
                .to.be.revertedWith("Inactive stream");
        });

        it("Should deactivate stream after cancellation", async function () {
            await streamPayCore.connect(sender).cancelStream(0);

            const streamInfo = await streamPayCore.getStreamInfo(0);
            expect(streamInfo.active).to.equal(false);
        });
    });

    describe("Pause/Unpause", function () {
        it("Should prevent stream creation when paused", async function () {
            await streamPayCore.pause();

            const ratePerSecond = STREAM_AMOUNT / BigInt(STREAM_DURATION);

            await expect(
                streamPayCore.connect(sender).createStream(
                    recipient.address,
                    token.target,
                    STREAM_AMOUNT,
                    ratePerSecond,
                    STREAM_DURATION
                )
            ).to.be.revertedWith("Pausable: paused");
        });

        it("Should allow operations after unpause", async function () {
            await streamPayCore.pause();
            await streamPayCore.unpause();

            const ratePerSecond = STREAM_AMOUNT / BigInt(STREAM_DURATION);

            const tx = await streamPayCore.connect(sender).createStream(
                recipient.address,
                token.target,
                STREAM_AMOUNT,
                ratePerSecond,
                STREAM_DURATION
            );

            await expect(tx).to.not.be.reverted;
        });

        it("Should only allow owner to pause", async function () {
            await expect(streamPayCore.connect(sender).pause())
                .to.be.revertedWith("Ownable: caller is not the owner");
        });
    });

    describe("Edge Cases", function () {
        it("Should handle stream expiration correctly", async function () {
            const ratePerSecond = STREAM_AMOUNT / BigInt(STREAM_DURATION);
            await streamPayCore
                .connect(sender)
                .createStream(
                    recipient.address,
                    token.target,
                    STREAM_AMOUNT,
                    ratePerSecond,
                    STREAM_DURATION
                );

            // Avançar além do tempo final
            await time.increase(STREAM_DURATION + 1000);

            const claimable = await streamPayCore.availableToClaim(0);

            // Deve poder reivindicar praticamente tudo (tolerância para arredondamento)
            expect(claimable).to.be.closeTo(STREAM_AMOUNT, ethers.parseEther("0.1"));

            // Após reivindicar, stream deve estar inativo
            await streamPayCore.connect(recipient).claim(0);

            const streamInfo = await streamPayCore.getStreamInfo(0);
            expect(streamInfo.active).to.equal(false);
        });

        it("Should handle withdraw of expired stream", async function () {
            const ratePerSecond = STREAM_AMOUNT / BigInt(STREAM_DURATION);
            await streamPayCore
                .connect(sender)
                .createStream(
                    recipient.address,
                    token.target,
                    STREAM_AMOUNT,
                    ratePerSecond,
                    STREAM_DURATION
                );

            // Expirar stream
            await time.increase(STREAM_DURATION + 1000);

            // Cancelar para deativá-lo
            await streamPayCore.connect(sender).cancelStream(0);

            // Tentar withdrawal (não deve haver saldo a retirar pois tudo foi pago)
            const streamInfo = await streamPayCore.getStreamInfo(0);
            expect(streamInfo.remainingBalance).to.equal(0);
        });
    });

    describe("Gas Optimization", function () {
        it("Should not exceed reasonable gas limits for stream creation", async function () {
            const ratePerSecond = STREAM_AMOUNT / BigInt(STREAM_DURATION);

            const tx = await streamPayCore.connect(sender).createStream(
                recipient.address,
                token.target,
                STREAM_AMOUNT,
                ratePerSecond,
                STREAM_DURATION
            );

            const receipt = await tx.wait();
            expect(receipt?.gasUsed).to.be.lessThan(300000); // Razoável para criação com SafeERC20
        });

        it("Should not exceed reasonable gas limits for claim", async function () {
            const ratePerSecond = STREAM_AMOUNT / BigInt(STREAM_DURATION);
            await streamPayCore
                .connect(sender)
                .createStream(
                    recipient.address,
                    token.target,
                    STREAM_AMOUNT,
                    ratePerSecond,
                    STREAM_DURATION
                );

            await time.increase(STREAM_DURATION / 2);

            const tx = await streamPayCore.connect(recipient).claim(0);
            const receipt = await tx.wait();

            expect(receipt?.gasUsed).to.be.lessThan(150000); // Razoável para claim
        });
    });
});
