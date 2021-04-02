pragma solidity ^0.5.0;

contract UserManagement {

  //counter variables
  uint public participant_count = 0;
  uint public order_count = 0;

  //define a Participant
  struct participant {
    uint id;
    string name;
    string organisation_name;
    string role;
    address participant_address;
    uint[] orders;
  }

  //Store Participants
  mapping(address => participant) public participants;

  //define an order
  struct order {
    uint id;
    address sender;
    address recipient;
    string content;
    string status;
    uint cost;
    address storage_provider;
    address logistics_provider;
    bool storage_provider_approval;
    bool logistics_provider_approval;
  }

  //store orders
  mapping(uint => order) public orders;

  function createParticipant(string memory name, string memory organisation_name,
    string memory role, address participant_address) public {
      //create and store a participant
      participants[participant_address].name = name;
      participants[participant_address].organisation_name = organisation_name;
      participants[participant_address].role = role;
      participants[participant_address].name = name;
      participants[participant_address].participant_address = participant_address;
      uint[] memory orders;
      participants[participant_address].orders = orders;
    }

  function createOrder(address sender, address recipient, string memory content,
    uint cost, address storage_provider, address logistics_provider) public {
    //if the sender address is equal to the recipient address
    if(sender == recipient) {
      revert("The sender and recipient address cannot be the same!");
    }
    //if one of the users does not exist
    if(participants[sender].participant_address == address(0x0) ||
      participants[recipient].participant_address == address(0x0) ||
      participants[storage_provider].participant_address == address(0x0) ||
      participants[logistics_provider].participant_address == address(0x0)) {
      //throw error
      revert("One of the participants provided does not exist.");
    } else {
      //create and store an order
      order_count++;
      orders[order_count].id = order_count;
      orders[order_count].sender = sender;
      orders[order_count].recipient = recipient;
      orders[order_count].cost = cost;
      orders[order_count].content = content;
      orders[order_count].status = "awaiting approval";
      orders[order_count].storage_provider = storage_provider;
      orders[order_count].logistics_provider = logistics_provider;
      orders[order_count].storage_provider_approval = false;
      orders[order_count].logistics_provider_approval = false;
      //create a reference to this order for each participant
      participants[sender].orders.push(order_count);
      participants[recipient].orders.push(order_count);
    }
    if(sender != storage_provider && recipient != storage_provider) {
      participants[storage_provider].orders.push(order_count);
    }
    if(sender != logistics_provider && recipient != logistics_provider) {
      participants[logistics_provider].orders.push(order_count);
    }
  }

  //return orders belonging to a particular user
  function getOrders(address p_ad) public view returns (uint[] memory){
    return participants[p_ad].orders;
  }

  function approve(address p_ad, uint order_id) public {
    order memory ord = orders[order_id];
    //check if the order exists
    if(ord.id == 0) {
      //throw error
      revert("Order does not exist.");
    }
    //if the order is not approved
    if(keccak256(abi.encodePacked(ord.status))
      == keccak256("awaiting approval")) {
      //if the approving user is a storage provider
      if((p_ad == ord.storage_provider) && (ord.storage_provider_approval != true)) {
        orders[order_id].storage_provider_approval = true;
      }
      //if the approving user is a logistics_provider
      else if ((p_ad == ord.logistics_provider) && ord.logistics_provider_approval == false) {
        orders[order_id].logistics_provider_approval = true;
      }
      //if the approving user is a storage provider
      else if ((p_ad == ord.recipient) && (ord.logistics_provider_approval == true)
        && (ord.storage_provider_approval == true)) {
        orders[order_id].status = "approved";
      } else {
        //throw error
        revert("You do not have permissions do approve this order.");
      }
    } else {
      //throw error
      revert("This order has already been approved.");
    }
  }
}
