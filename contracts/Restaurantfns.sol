pragma solidity ^0.5.0;

contract Restaurantfns {

    uint public res_count = 0;

    struct Restaurant {
    uint id;
    string res_name;
    bool available;
    }

  mapping(uint => Restaurant) public restaurants;

  event Res_added(
    uint id,
    string res_name,
    bool available
  );

  event Not_available(
    uint id,
    bool available
  );

  constructor() public {
    add_restaurant("Pizza Hut");
  }

  function add_restaurant(string memory _name) public {
    res_count ++;
    restaurants[res_count] = Restaurant(res_count,_name, false);
    emit Res_added(res_count, _name, false);
  }

  function Res_not_opened(uint _id) public {
    Restaurant memory _res = restaurants[_id];
    _res.available = !_res.available;
    restaurants[_id] = _res;
    emit Not_available(_id,_res.available);
    }

}