import { expect } from "chai";
import hre from "hardhat";
const { ethers } = hre;

describe("Minimal Test", function () {
    it("Should deploy StreamPayCore", async function () {
        const StreamPayCore = await ethers.getContractFactory("StreamPayCore");
        console.log("Constructor fragment:", StreamPayCore.interface.deploy);
        
        const streamPayCore = await StreamPayCore.deploy();
        await streamPayCore.waitForDeployment();
        
        const address = await streamPayCore.getAddress();
        console.log("Deployed at:", address);
        
        expect(address).to.not.equal("0x0000000000000000000000000000000000000000");
    });
});
