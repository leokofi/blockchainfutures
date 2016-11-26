module.exports = function(deployer) {
    deployer.deploy(UportRegistry);
    deployer.deploy(token);
    deployer.deploy(FirmRegistration);
};
