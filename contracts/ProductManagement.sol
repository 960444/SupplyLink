pragma solidity ^0.5.0;

contract ProductManagement  {

  //counter variables
  uint public transfer_count = 0;
  uint public part_count = 0;
  uint public vehicle_count = 0;
  uint public batch_count = 0;

  //define product representations
  struct part {
    uint id;
    string serial_number;
    string part_type;
    string model;
    string manufacturer;
    string place_of_manufacture;
    uint vehicle_id;
    address owner;
  }

  struct vehicle {
    uint id;
    string vin;
    string manufacturer;
    string model;
    string place_of_manufacture;
    uint part_count;
    address owner;
    //store vehicles parts
    mapping (uint => uint) parts;
  }

  struct batch {
    uint id;
    uint order_id;
    uint quantity;
    uint cost;
    string product;
    string manufacturer;
    string status;
    address sender;
    address recipient;

  }
  //define a transfer representation
  struct transfer {
    uint id;
    uint product_id;
    string p_serial_number;
    string product_type;
    address previous_owner;
    address new_owner;
    uint timestamp;
  }

  //storing product instances
  mapping(uint => part) public parts;
  mapping(uint => vehicle) public vehicles;
  mapping(uint => batch) public batches;

  //storing transfer instances
  mapping(uint => transfer) public transfers;

  function createPart(string memory serial_number, string memory part_type,
    string memory model, string memory manufacturer, string memory
    place_of_manufacture, address owner) public {
    //create and store a part instance
    part_count++;
    parts[part_count].id = part_count;
    parts[part_count].serial_number = serial_number;
    parts[part_count].part_type = part_type;
    parts[part_count].model = model;
    parts[part_count].manufacturer = manufacturer;
    parts[part_count].place_of_manufacture = place_of_manufacture;
    parts[part_count].vehicle_id = 0;
    parts[part_count].owner = owner;
  }

  function createVehicle(string memory vin, string memory manufacturer, string memory model,
    string memory place_of_manufacture, address owner) public {
    //create and store a vehicle instance
    vehicle_count++;
    vehicles[vehicle_count].id = vehicle_count;
    vehicles[vehicle_count].vin = vin;
    vehicles[vehicle_count].manufacturer = manufacturer;
    vehicles[vehicle_count].model = model;
    vehicles[vehicle_count].place_of_manufacture = place_of_manufacture;
    vehicles[vehicle_count].part_count = 0;
    vehicles[vehicle_count].owner = owner;
  }

  function createBatch(uint order_id, uint quantity, uint cost, string memory product,
    string memory manufacturer, address sender, address recipient) public {
    //create and store a batch instance
    batch_count++;
    batches[batch_count].id = batch_count;
    batches[batch_count].order_id = order_id;
    batches[batch_count].quantity = quantity;
    batches[batch_count].cost = cost;
    batches[batch_count].product = product;
    batches[batch_count].manufacturer = manufacturer;
    batches[batch_count].status = "unrecieved";
    batches[batch_count].sender = sender;
    batches[batch_count].recipient = recipient;
  }

  function associatePart(uint part_id, uint vehicle_id, address user) public {
    //if the part and vehicle belong to the user
    if(parts[part_id].owner == user && vehicles[vehicle_id].owner == user) {
      //if the part does not belong to a vehicle
      if(parts[part_id].vehicle_id == 0) {
        //create an association
        parts[part_id].vehicle_id = vehicle_id;
        vehicles[vehicle_id].part_count++;
        vehicles[vehicle_id].parts[vehicles[vehicle_id].part_count] = part_id;
      } else {
        //if the part already belongs to a vehicle find that vehicle
        uint current_vehicle = parts[part_id].vehicle_id;
        uint old_count = vehicles[vehicle_id].part_count + 1;
        //remove the part from the current vehicle
        for(uint i = 1; i <= old_count; i++) {
          if(vehicles[current_vehicle].parts[i] == part_id) {
            vehicles[current_vehicle].parts[i] = 0;
          }
        }
        //add the part to the new vehicle
        parts[part_id].vehicle_id = vehicle_id;
        vehicles[vehicle_id].part_count++;
        vehicles[vehicle_id].parts[vehicles[vehicle_id].part_count] = part_id;
      }
    } else {
      //throw an error
      revert("Part and/or vehicle does not belong to this user!");
    }
  }

  //find a vehicle part by key
  function getVehiclePart(uint vehicle_id, uint key) public view returns(uint) {
    return vehicles[vehicle_id].parts[key];
  }

  function transferPart(address previous_owner, address new_owner, uint part_id) public {
    //if the transfering user owns the part
    if(parts[part_id].owner == previous_owner) {
      //transfer part
      parts[part_id].owner = new_owner;
      //create and store a transfer instance
      transfer_count++;
      transfers[transfer_count].id = transfer_count;
      transfers[transfer_count].product_id = part_id;
      transfers[transfer_count].p_serial_number = parts[part_id].serial_number;
      transfers[transfer_count].product_type = "part";
      transfers[transfer_count].previous_owner = previous_owner;
      transfers[transfer_count].new_owner = new_owner;
      transfers[transfer_count].timestamp = uint(now);
    } else {
      //throw error
      revert("Vehicle does not belong to this user!");
    }
  }

  function recieveBatch(address new_owner, uint batch_id) public {
    //if the recieveing user is the recipient of the batch
    if(batches[batch_id].recipient == new_owner) {
      transfer_count++;
      //set the batch status as recieved
      batches[batch_id].status = "recieved";
      //record asset transfer
      transfers[transfer_count].id = transfer_count;
      transfers[transfer_count].product_id = batch_id;
      transfers[transfer_count].p_serial_number = "not applicable";
      transfers[transfer_count].product_type = "batch";
      transfers[transfer_count].previous_owner = batches[batch_id].sender;
      transfers[transfer_count].new_owner = batches[batch_id].recipient;
      transfers[transfer_count].timestamp = uint(now);
    } else {
      //throw error
      revert("You are not the recipient of this batch!");
    }
  }

  function transferVehicle(address previous_owner, address new_owner,
    uint id) public {
    //if the transfering user owns the part
    if(vehicles[vehicle_id].owner == previous_owner) {
      //transfer vehicle
      vehicles[id].owner = new_owner;
      //create and store a transfer instance
      transfer_count++;
      transfers[transfer_count].id = transfer_count;
      transfers[transfer_count].product_id = id;
      transfers[transfer_count].p_serial_number = vehicles[id].vin;
      transfers[transfer_count].product_type = "vehicle";
      transfers[transfer_count].previous_owner = previous_owner;
      transfers[transfer_count].new_owner = new_owner;
      transfers[transfer_count].timestamp = uint(now);
    } else {
      //throw error
      revert("You are not the recipient of this batch!");
    }
  }
}
