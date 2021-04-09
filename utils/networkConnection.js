const fs = require('fs');
const path = require('path');

const { Gateway, Wallets } = require('fabric-network');
console.log("asdasdasdasdasdasdasdasdasdasd",Gateway)
async function getGateWay(orgNumber, userName) {
    // load the network configuration
    //console.log("this is getgateway")
    const ccpPath = path.resolve(
        __dirname,
        '..',
        '..',
        'test-network',
        'organizations',
        'peerOrganizations',
        `org${orgNumber}.example.com`,
        `connection-org${orgNumber}.json`
    );
        // console.log("ccPath",ccpPath);
        // console.log(fs.readFileSync(ccpPath));
    const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));

    // console.log("ccp123")
    // console.log("ccp",JSON.parse(fs.readFileSync(ccpPath, 'utf8')));
    // console.log(ccp);
    // console.log(__dirname);
    const walletPath = path.join(__dirname, '../wallet');
    const wallet = await Wallets.newFileSystemWallet(walletPath);
        //console.log("wallet",wallet);
    // Create a new gateway for connecting to our peer node.
    const gateway = await new Gateway();
    //console.log("gatewayyyyy",gateway);
    console.log("waaaaaaaallllllleeeeeet");
    console.log(wallet);
    console.log(ccp);
    console.log(userName);
    gateway.connect(ccp, {
        wallet,
        identity: userName,
        discovery: { enabled: true, asLocalhost: true },
    });
    
    // console.log("gateway")
    // console.log(gateway);
    return gateway;
}

exports.evaluateTransaction = async (transaction, orgNumber, userName, params = null) => {

    const gateway = await getGateWay(orgNumber, userName);

    // Get the network (channel) our contract is deployed to.
    const network = await gateway.getNetwork('mychannel');

    // Get the contract from the network.
    const contract = network.getContract('eKYC');
    const result =
        params ?
            await contract.evaluateTransaction(transaction, ...params) :
            await contract.evaluateTransaction(transaction);

    gateway.disconnect();

    return result;
}
exports.submitTransaction = async (transaction, orgNumber, userName, params = null) => {

    const gateway = await getGateWay(orgNumber, userName);
    console.log("gateway",gateway)
    // Get the network (channel) our contract is deployed to.
    console.log("asdasdasdasdasdasdasdasd")
    
    console.log(gateway.getNetwork('mychannel'));
    const network = await gateway.getNetwork('mychannel');
    
    console.log("network",network)
    
    // Get the contract from the network.
    const contract = network.getContract('eKYC');
    console.log("contract",contract)
    const result =
        params ?
            await contract.submitTransaction(transaction, ...params) :
            await contract.submitTransaction(transaction);

    gateway.disconnect();

    return result;
};