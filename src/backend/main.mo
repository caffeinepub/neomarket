import Map "mo:core/Map";
import List "mo:core/List";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Time "mo:core/Time";
import Iter "mo:core/Iter";

import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";



actor {
  // Initialize the access control system
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  type QuestionAnswerPair = {
    question : Text;
    answer : Text;
  };

  type CheatSheet = {
    title : Text;
    content : [QuestionAnswerPair];
    createdAt : Int;
  };

  public type CheatSheetInput = {
    title : Text;
    content : [QuestionAnswerPair];
  };

  // Map from Principal to a list of CheatSheets
  let userSheets = Map.empty<Principal, List.List<CheatSheet>>();
  public query ({ caller }) func getSheetsForUser(user : Principal) : async [CheatSheet] {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("NotAuthorized");
    };
    switch (userSheets.get(user)) {
      case (?list) { list.toArray() };
      case (null) { [] };
    };
  };

  public shared ({ caller }) func addSheet(sheet : CheatSheetInput) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("InvalidUser");
    };
    let newSheet = {
      title = sheet.title;
      content = sheet.content;
      createdAt = Time.now();
    };

    let sheets = switch (userSheets.get(caller)) {
      case (?list) { list.add(newSheet); list };
      case (null) {
        let list = List.empty<CheatSheet>();
        list.add(newSheet);
        list;
      };
    };
    userSheets.add(caller, sheets);
  };

  public shared ({ caller }) func deleteSheet(title : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("InvalidUser");
    };

    switch (userSheets.get(caller)) {
      case (?list) {
        let filtered = list.filter(
          func(sheet) { sheet.title != title }
        );
        list.clear();
        let copied = List.fromArray<CheatSheet>(filtered.toArray());
        list.addAll(copied.values());
        userSheets.add(caller, list);
      };
      case (null) { Runtime.trap("NotFound") };
    };
  };

  public query ({ caller }) func getAllSheets() : async [CheatSheet] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view all sheets");
    };

    let allSheets = List.empty<CheatSheet>();
    let iter = userSheets.values();
    iter.forEach(
      func(list) {
        if (not list.isEmpty()) {
          allSheets.addAll(list.values());
        };
      }
    );
    allSheets.toArray();
  };
};

