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
        // Request account access if needed
        await ethereum.enable();
        // Acccounts now exposed
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

  associatePart: async () => {
    const part_id = parseInt(($('#part_id').val()), 10);
    const vehicle_id = parseInt(($('#vehicle_id').val()), 10);
    await App.productManagement.associatePart(part_id, vehicle_id, App.account);
  },

  displayParts: async () => {
    //find the vehicle
    const vehicle_id = parseInt(($('#v_id').val()), 10);
    const vehicle = await App.productManagement.vehicles(vehicle_id);
    const part_count = Number(vehicle[5]);
    //loop loop through all parts belonging to this vehicle
    for(var i = 1; i <= part_count; i++) {
      const part_id = Number(await App.productManagement.getVehiclePart(vehicle_id, i));
      const part = await App.productManagement.parts(part_id);
      //if the part exists display it
      if(part_id != 0) {
        const list = '<div class="list-orders"><ul class="list-group">';
        const part_id = '<li class="list-group-item">' + '<p><b>Part id:</b> ' + part[0] + '</p>' + '</li>';
        const serial_number = '<li class="list-group-item">' +   '<p><b>Serial number: </b>' + part[1] + '</p>' + '</li>';
        const type = '<li class="list-group-item">' + '<p><b>Part type: </b>' + part[2] + '</p>' + '</li>';
        const model = '<li class="list-group-item">' + '<p><b>Model:</b> ' + part[3] + '</p>' + '</li>';
        const manufacturer = '<li class="list-group-item">' + '<p><b>Manufacturer:</b> ' + part[4] + '</p>' + '</li>';
        const place = '<li class="list-group-item">' + '<p><b>Place of manufacture:</b> ' + part[5] + '</p>' + '</li>';
        const owner = '<li class="list-group-item">' + '<p><b>Owner:</b> ' + part[7] + '</p>' + '</li>';
        const part_info = list + part_id + serial_number + type + model + manufacturer + place + owner + '<hr>' + '</ul></div>';
        //display the part
        document.getElementById("parts").innerHTML += part_info;
      }
    }
  },

  displayOrders: async () => {
    const orders = await App.userManagement.getOrders(App.account);
    //const leng = orders.length
    const order = await App.userManagement.orders(1);
    const displayed_orders = [];
    for(var i = 0; i <= orders.length; i++) {
      const order = await App.userManagement.orders(orders[i]);
      if(!displayed_orders.includes(order[0])) {
        displayed_orders.push(order[0]);
        const order_id = '<p><b>Order id:</b> ' + order[0] + '</p>';
        const sender_address = '<p><b>Sender address: </b>' + order[1] + '</p>';
        const recipient_address = '<p><b>Recipient address:</b> ' + order[2] + '</p>';
        const order_content = '<p><b>Order content:</b> ' + order[3] + '</p>';
        const order_status = '<p><b>Status:</b> ' + order[4] + '</p>';
        const cost = '<p><b>Cost:</b> ' + order[5] + '</p>';
        const logistics_provider = '<p><b>Logistics provider:</b> ' + order[6] + '</p>';
        const storage_provider = '<p><b>Storage provider:</b> ' + order[7] + '</p>';
        const logistics_approval = '<p><b>Logistics approval:</b> ' + order[8] + '</p>';
        const storage_approval  = '<p><b>Storage approval:</b> ' + order[9] + '</p>';
        const order_info = order_id + sender_address + recipient_address + order_content;
          + order_status + cost + logistics_provider + storage_provider + logistics_approval;
          + storage_approval + '<hr>';
        document.getElementById("orders").innerHTML += order_info;
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
