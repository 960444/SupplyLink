App = {
  loading: false,
  contracts: {},

  load: async () => {
    await App.loadWeb3();
    await App.loadAccount();
    await App.loadContract();
  },

  // https://medium.com/metamask/https-medium-com-metamask-breaking-change-injecting-web3-7722797916a8
  loadWeb3: async () => {
    if (typeof web3 !== 'undefined') {
      App.web3Provider = web3.currentProvider;
      web3 = new Web3(web3.currentProvider);
    } else {
      window.alert("Please connect to Metamask.");
    }
    // Modern dapp browsers...
    if (window.ethereum) {
      window.web3 = new Web3(ethereum);
      try {
        //Request account access if needed
        await ethereum.enable();
        //Acccounts now exposed
        web3.eth.sendTransaction({/* ... */ });
      } catch (error) {
        // User denied account access...
      }
    }
    // Legacy dapp browsers...
    else if (window.web3) {
      App.web3Provider = web3.currentProvider;
      window.web3 = new Web3(web3.currentProvider);
      // Acccounts always exposed
      web3.eth.sendTransaction({/* ... */ });
    }
    // Non-dapp browsers...
    else {
      console.log('Non-Ethereum browser detected. You should consider trying MetaMask!');
    }
    },
    loadAccount: async () => {
      // Set the current blockchain account
      App.account = web3.eth.accounts[0];
    },

    loadContract: async () => {
      // Create a JavaScript version of the smart contract
      const productManagement = await $.getJSON('ProductManagement.json');
      App.contracts.ProductManagement = TruffleContract(productManagement);
      App.contracts.ProductManagement.setProvider(App.web3Provider);
      // Hydrate the smart contract with values from the blockchain
      App.productManagement = await App.contracts.ProductManagement.deployed();
    },

    createBatch: async () => {
      //retrieve values from the html form
      const order_id = parseInt(($('#order_id').val()), 10);
      const quantity = parseInt(($('#quantity').val()), 10);
      const cost = parseInt(($('#cost').val()), 10);
      const product = $('#product').val();
      const manufacturer = $('#bmanufacturer').val();
      const recipient = $('#recipient').val();
      //call the createBatch function
      await App.productManagement.createBatch(order_id, quantity, cost, product,
        manufacturer, App.account, recipient);
    },

    createPart: async () => {
      //retrieve values from the html form
      const serial_number = $('#serial_number').val();
      const part_type = $('#part_type').val();
      const model = $('#model').val();
      const manufacturer = $('#manufacturer').val();
      const place = $('#place').val();
      //call the createPart function
      await App.productManagement.createPart(serial_number, part_type, model,
        manufacturer, place, App.account);
    },

    createVehicle: async () => {
      //retrieve parameters from the form
      const vin = $('#vin').val();
      const manufacturer = $('#vmanufacturer').val();
      const model = $('#vmodel').val();
      const place = $('#vplace').val();
      //call the createVehicle function
      await App.productManagement.createVehicle(vin, manufacturer, model, place, App.account);
    },
}

//load the controller
$(() => {
    $(window).load(() => {
        App.load();
    });
});
