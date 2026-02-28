import Map "mo:core/Map";
import List "mo:core/List";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Migration "migration";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";

(with migration = Migration.run)
actor {
  // Initialize the access control system
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  let userWatchlists = Map.empty<Principal, List.List<Text>>();
  let userCurrencies = Map.empty<Principal, Text>();

  // User Profile Type
  public type UserProfile = {
    name : Text;
  };

  let userProfiles = Map.empty<Principal, UserProfile>();

  // User Profile Management Functions
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Watchlist Management Functions
  public shared ({ caller }) func addToWatchlist(symbol : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can modify watchlist");
    };
    updateWatchlist(caller, func(currentList) { currentList.add(symbol) });
  };

  public shared ({ caller }) func removeFromWatchlist(symbol : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can modify watchlist");
    };
    updateWatchlist(
      caller,
      func(currentList) {
        let filtered = currentList.filter(
          func(item) { item != symbol }
        );
        currentList.clear();
        let copied = List.fromArray(filtered.toArray());
        currentList.addAll(copied.values());
      },
    );
  };

  public query ({ caller }) func getWatchlist() : async [Text] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access watchlist");
    };
    getWatchlistByUserSync(caller);
  };

  public query ({ caller }) func getWatchlistByUser(user : Principal) : async [Text] {
    // Only allow viewing own watchlist or admin can view any
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own watchlist");
    };
    getWatchlistByUserSync(user);
  };

  func getWatchlistByUserSync(user : Principal) : [Text] {
    switch (userWatchlists.get(user)) {
      case (null) { [] };
      case (?watchlist) { watchlist.toArray() };
    };
  };

  // Currency Preference Functions
  public shared ({ caller }) func setPreferredCurrency(currency : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can set preferred currency");
    };
    userCurrencies.add(caller, currency);
  };

  public query ({ caller }) func getPreferredCurrency() : async ?Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access preferred currency");
    };
    userCurrencies.get(caller);
  };

  // Helper function
  func updateWatchlist(user : Principal, updateFn : (List.List<Text>) -> ()) {
    switch (userWatchlists.get(user)) {
      case (null) {
        let newList = List.empty<Text>();
        updateFn(newList);
        userWatchlists.add(user, newList);
      };
      case (?currentList) { updateFn(currentList) };
    };
  };
};

