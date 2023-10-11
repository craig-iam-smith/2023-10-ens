const { expect } = require('chai');
const { ethers, deployments, getNamedAccounts } = require('hardhat');
const namehash = require('@ensdomains/eth-ens-namehash');
const { utils } = ethers;

const label = 'eth';
const labelHash = utils.keccak256(utils.toUtf8Bytes(label));
const node = namehash.hash(label);
const ROOT_NODE =
  '0x0000000000000000000000000000000000000000000000000000000000000000';

function increaseTime(secs) {
  return ethers.provider.send('evm_increaseTime', [secs]);
}


describe('ENS Multi Delegate', () => {
  let firstDelegator;
  let token;
  let deployer;
  let alice;
  let bob;
  let charlie;
  let dave;
  let resolver;
  let registry;
  let snapshot;
  let multiDelegate;

  before(async () => {
    ({ deployer, alice, bob, charlie, dave } = await getNamedAccounts());
    [firstDelegator] = await ethers.getSigners();
  });

  beforeEach(async () => {
    snapshot = await ethers.provider.send('evm_snapshot', []);

    await deployments.fixture(['ENSToken']);
    token = await ethers.getContract('ENSToken');

    const Registry = await ethers.getContractFactory('ENSRegistry');
    registry = await Registry.deploy();
    await registry.deployed();

    const Resolver = await ethers.getContractFactory('PublicResolver');
    resolver = await Resolver.deploy(
      registry.address,
      ethers.constants.AddressZero
    );
    await resolver.deployed();

    const ENSMultiDelegate = await ethers.getContractFactory(
      'ERC20MultiDelegate'
    );
    multiDelegate = await ENSMultiDelegate.deploy(
      token.address,
      'http://localhost:8080/{id}'
    );
    await multiDelegate.deployed();

    await registry.setSubnodeOwner(ROOT_NODE, labelHash, deployer);
    await registry.setResolver(node, resolver.address);

    await increaseTime(365 * 24 * 60 * 60);
    const mintAmount = (await token.totalSupply()).div(50);
    await token.mint(deployer, mintAmount);
  });

  afterEach(async () => {
    await ethers.provider.send('evm_revert', [snapshot]);
  });

  describe('deposit', () => {

    it('delegating ZERO tokens is not disallowed', async () => {
      let firstDelegatorBalance = await token.balanceOf(firstDelegator.address);

      // no need to Give allowances to multiDelegate contract
    
      // lots of delegates, for more impact use unique delegates
      let delegates = [alice, bob, charlie, dave, alice, bob, charlie, dave, alice, bob, charlie, dave, alice, bob, charlie, dave, alice, bob, charlie, dave];
      // amounts of zero, little cost to attacker
      const amounts = delegates.map(() => 0);

      /// @notice - if delegates are unique, deploys proxy delegators for each delegate
      /// @notice - does not delegate anything 
      /// @notice - does not transfer any tokens 
      /// @notice - does not revert 
      /// @notice - completes and uses gas */
      await multiDelegate.delegateMulti([], delegates, amounts);

    });
  });

});
