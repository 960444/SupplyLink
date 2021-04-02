App = {
  loading: false,
  contracts: {},

  load: async () => {
    await App.loadWeb3();
    await App.loadAccount();
    await App.loadContract();
    await App.displayBatches();
    await App.displayParts();
    await App.displayVehicles();
  },

  //Connect to METAMASK through web3
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
          // Request account access if needed
          await ethereum.enable();
          // Acccounts now exposed
          web3.eth.sendTransaction({/* ... */ });
        } catch (error) {
          // User denied account access..
          console.log(error);
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

    displayBatches: async () => {
      const batch_count = Number(await App.productManagement.batch_count());
      //loop through all batches
      for(var i = 1; i <= batch_count; i++) {
        //retrieve the batch instance
        const batch = await App.productManagement.batches(i);
        //if the batch belongs to the user
        if(batch[8] == App.account) {
          //create a table with batch information
          const list = '<div class="list-orders"><ul class="list-group">';
          const batch_id = '<li class="list-group-item">' + '<p><b>Batch id:</b> ' + batch[0] + '</p>' + '</li>';
          const order_id = '<li class="list-group-item">' + '<p><b>Order id: </b>' + batch[1] + '</p>';
          const quantity = '<li class="list-group-item">' + '<p><b>Quantity:</b> ' + batch[2] + '</p>';
          const cost = '<li class="list-group-item">' + '<p><b>Cost:</b> ' + batch[3] + '</p>';
          const product = '<li class="list-group-item">' + '<p><b>Product:</b> ' + batch[4] + '</p>';
          const manufacturer = '<li class="list-group-item">' + '<p><b>Manufacturer:</b> ' + batch[5] + '</p>';
          const status = '<li class="list-group-item">' + '<p><b>Status:</b> ' + batch[6] + '</p>';
          const sender = '<li class="list-group-item">' + '<p><b>Sender:</b> ' + batch[7] + '</p>';
          const recipient = '<li class="list-group-item">' + '<p><b>Recipient:</b> ' + batch[8] + '</p>';
          const batch_info = list + batch_id + order_id + quantity + cost + product + manufacturer + status + sender +
           recipient + '<hr>' + '</ul></div>';
          //display the table in the view
          document.getElementById("batches").innerHTML += batch_info;
        }
      }
    },

    displayParts: async () => {
      const part_count = Number(await App.productManagement.part_count());
      //loop through all parts
      for(var i = 1; i <= part_count; i++) {
        //retreive a part instance
        const part = await App.productManagement.parts(i);
        //if the part belongs to the user
        if(part[7] == App.account) {
          //display table with part information
          const list = '<div class="list-orders"><ul class="list-group">';
          const part_id = '<li class="list-group-item">' + '<p><b>Part id:</b> ' + part[0] + '</p>' + '</li>';
          const serial_number = '<li class="list-group-item">' +   '<p><b>Serial number: </b>' + part[1] + '</p>' + '</li>';
          const type = '<li class="list-group-item">' + '<p><b>Part type: </b>' + part[2] + '</p>' + '</li>';
          const model = '<li class="list-group-item">' + '<p><b>Model:</b> ' + part[3] + '</p>' + '</li>';
          const manufacturer = '<li class="list-group-item">' + '<p><b>Manufacturer:</b> ' + part[4] + '</p>' + '</li>';
          const place = '<li class="list-group-item">' + '<p><b>Place of manufacture:</b> ' + part[5] + '</p>' + '</li>';
          const owner = '<li class="list-group-item">' + '<p><b>Owner:</b> ' + part[7] + '</p>' + '</li>';
          const part_info = list + part_id + serial_number + type + model + manufacturer + place + owner + '<hr>' + '</ul></div>';
          document.getElementById("parts").innerHTML += part_info;
        }
      }
    },

    displayVehicles: async () => {
      const vehicle_count = Number(await App.productManagement.vehicle_count());
      //loop through all vehicles
      for(var i = 1; i <= vehicle_count; i++) {
        //retrieve a vehicle instance
        const vehicle = await App.productManagement.vehicles(i);
        //if the vehicle belongs to the user
        if(vehicle[6] == App.account) {
          //create a table with vehicle information
          const list = '<div class="list-orders"><ul class="list-group">';
          const vehicle_id = '<li class="list-group-item">' + '<p><b>Vehicle id:</b> ' + vehicle[0] + '</p>'+'</li>';
          const vin =  '<li class="list-group-item">' + '<p><b>VIN: </b>' + vehicle[1] + '</p>' +'</li>';
          const manufacturer =  '<li class="list-group-item">' + '<p><b>Manufacturer:</b> ' + vehicle[2] + '</p>' +'</li>';
          const place =  '<li class="list-group-item">' + '<p><b>Place of manufacture:</b> ' + vehicle[4] + '</p>' +'</li>';
          const owner =  '<li class="list-group-item">' + '<p><b>Owner:</b> ' + vehicle[6] + '</p>' +'</li>';
          const vehicle_info = list + vehicle_id + vin + manufacturer + place + owner + '<hr>' + '</ul></div>';
          //display the table
          document.getElementById("vehicles").innerHTML += vehicle_info;
        }
      }
    },
}

//load the controller
$(() => {
    $(window).load(() => {
        App.load();
    });
});
