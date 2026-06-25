const { expect } = require("chai");
const hre = require("hardhat");

describe("ZyncToken", function () {
  it("mints ZYNC for ETH at the public price", async function () {
    const [, buyer] = await hre.ethers.getSigners();
    const price = hre.ethers.parseEther("0.001");
    const Z = await hre.ethers.getContractFactory("ZyncToken");
    const token = await Z.deploy(price);
    await token.waitForDeployment();

    const tx = await token.connect(buyer).mintWithEth({ value: price });
    await tx.wait();

    const bal = await token.balanceOf(buyer.address);
    expect(bal).to.equal(hre.ethers.parseEther("1"));

    expect(await hre.ethers.provider.getBalance(await token.getAddress())).to.equal(price);
  });


  it("should burn tokens successfully", async function () {
    const [owner, user] = await hre.ethers.getSigners();
    const price = hre.ethers.parseEther("0.001");

    const Z = await hre.ethers.getContractFactory("ZyncToken");
    const token = await Z.deploy(price);
    await token.waitForDeployment();

    await token.connect(user).mintWithEth({ value: price });

    const before = await token.balanceOf(user.address);

    // burn 1 Zynctok...
    await token.connect(user).burn(hre.ethers.parseEther("1"));

    const after = await token.balanceOf(user.address);

    expect(after).to.equal(before - hre.ethers.parseEther("1"));
  });


  it("should fail when burning more than balance", async function () {
    const [, user] = await hre.ethers.getSigners();
    const price = hre.ethers.parseEther("0.001");

    const Z = await hre.ethers.getContractFactory("ZyncToken");
    const token = await Z.deploy(price);
    await token.waitForDeployment();

    await token.connect(user).mintWithEth({ value: price });

    await expect(
      token.connect(user).burn(hre.ethers.parseEther("10"))
    ).to.be.reverted;
  });

  it("should allow burnFrom with allowance", async function () {
    const [owner, user, spender] = await hre.ethers.getSigners();
    const price = hre.ethers.parseEther("0.001");

    const Z = await hre.ethers.getContractFactory("ZyncToken");
    const token = await Z.deploy(price);
    await token.waitForDeployment();

    await token.connect(user).mintWithEth({ value: price });



    await token.connect(user).approve(spender.address, hre.ethers.parseEther("1"));

    // burnFrom
    await token.connect(spender).burnFrom(user.address, hre.ethers.parseEther("1"));

    const bal = await token.balanceOf(user.address);
    expect(bal).to.equal(0);
  });


  it("should fail burnFrom without allowance", async function () {
    const [, user, spender] = await hre.ethers.getSigners();
    const price = hre.ethers.parseEther("0.001");

    const Z = await hre.ethers.getContractFactory("ZyncToken");
    const token = await Z.deploy(price);
    await token.waitForDeployment();

    await token.connect(user).mintWithEth({ value: price });

    await expect(
      token.connect(spender).burnFrom(user.address, hre.ethers.parseEther("1"))
    ).to.be.reverted;
  });
});
