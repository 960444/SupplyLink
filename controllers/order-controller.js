App = {
  loading: false,
  contracts: {},

  load: async () => {
    await App.loadWeb3();
    await App.loadAccount();
    await App.loadContract();
    await App.displayOrders();
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
    //Create a JavaScript version of the smart contract
    const userManagement = await $.getJSON('UserManagement.json');
    App.contracts.UserManagement = TruffleContract(userManagement);
    App.contracts.UserManagement.setProvider(App.web3Provider);
    // Hydrate the smart contract with values from the blockchain
    App.userManagement = await App.contracts.UserManagement.deployed();
  },

  createOrder: async () => {
    const order_content = $('#order_content').val();
    const costString = $('#cost').val();
    const cost = parseInt(costString, 10);
    const recipient = $('#recipient').val();
    const storage_provider = $('#storage_provider').val();
    const logistics_provider = $('#logistics_provider').val();
    try {
      await App.userManagement.createOrder(App.account, recipient, order_content, cost, storage_provider, logistics_provider);
    } catch(err) {
      document.getElementById("error").innerHTML = "Incorrect data entered transaction failed please try again!";
    }
  },

  displayOrders: async () => {
    //retrieve an array containing users' orders ids
    const orders = await App.userManagement.getOrders(App.account);
    //store already displayed orders
    const displayed_orders = [];
      //loop through all orders
      for(var i = 0; i <= orders.length; i++) {
        //retrieve an order instance
        const order = await App.userManagement.orders(orders[i]);
        //if the order has not been displayed
        if(!displayed_orders.includes(order[0])) {
          //add the order to the displayed orders array
          displayed_orders.push(order[0]);
          //display the order
          const list = '<div class="list-orders"><ul class="list-group">';
          const order_id =   '<li class="list-group-item">' + '<p><b>Order id:</b> ' + order[0] + '</p>'+'</li>';
          const sender_address = '<li class="list-group-item">' +'<p><b>Sender address: </b>' + order[1] + '</p>' + '</li>';
          const recipient_address =  '<li class="list-group-item">' + '<p><b>Recipient address:</b> ' + order[2] + '</p>' + '</li>';
          const order_content = '<li class="list-group-item">' + '<p><b>Order content:</b> ' + order[3] + '</p>' + '</li>';
          const order_status = '<li class="list-group-item">' + '<p><b>Status:</b> ' + order[4] + '</p>' + '</li>';
          const cost = '<li class="list-group-item">' + '<p><b>Cost:</b> ' + order[5] + '</p>' + '</li>';
          const logistics_provider = '<li class="list-group-item">' + '<p><b>Logistics provider:</b> ' + order[6] + '</p>' + '</li>';
          const storage_provider = '<li class="list-group-item">' + '<p><b>Storage provider:</b> ' + order[7] + '</p>' + '</li>';
          const logistics_approval = '<li class="list-group-item">' + '<p><b>Logistics approval:</b> ' + order[8] + '</p>' + '</li>';
          const storage_approval  = '<li class="list-group-item">' + '<p><b>Storage approval:</b> ' + order[9] + '</p>' + '</li>';
          const order_info = order_id + sender_address + recipient_address + order_content
            + order_status + cost + logistics_provider + storage_provider + logistics_approval
            + storage_approval + '<hr>' + '</ul></div>';
          document.getElementById("orders").innerHTML += order_info;
        }
      }
    },

    approveOrder: async () => {
      const order_id = parseInt(($('#order_id').val()), 10);
      await App.userManagement.approve(App.account, order_id).catch(err => {
        document.getElementById("error-approve").innerHTML
        = "This order has already been approved or you do not have permissions to approve it.";
      });
    },
  }

//load the controller
$(() => {
    $(window).load(() => {
        App.load();
    });
});
