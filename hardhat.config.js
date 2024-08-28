require('@nomiclabs/hardhat-waffle')

module.exports = {
    solidity: '0.8.4',
    paths: {
        artifacts: './src/backend/artifacts',
        sources: './src/backend/contracts',
        cache: './src/backend/cache',
        tests: './src/backend/test',
    },
    networks: {
        hardhat: {
            // You can specify a gas limit here if you want to change the default
            gas: 12000000, // Example: Set the gas limit to 12 million
            blockGasLimit: 12000000, // Example: Set the block gas limit to 12 million
        },
    },
}
