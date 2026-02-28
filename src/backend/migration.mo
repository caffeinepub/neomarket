import Map "mo:core/Map";
import List "mo:core/List";
import Principal "mo:core/Principal";

module {
  type Game = {
    id : Nat;
    title : Text;
    category : Text;
    embedUrl : Text;
    playCount : Nat;
  };

  type OldActor = {
    games : Map.Map<Nat, Game>;
    userRecentlyPlayed : Map.Map<Principal, List.List<Nat>>;
    maxRecentlyPlayed : Nat;
    nextId : Nat;
  };
  type NewActor = {
    userWatchlists : Map.Map<Principal, List.List<Text>>;
    userCurrencies : Map.Map<Principal, Text>;
    userProfiles : Map.Map<Principal, { name : Text }>;
  };

  public func run(old : OldActor) : NewActor {
    {
      userWatchlists = Map.empty<Principal, List.List<Text>>();
      userCurrencies = Map.empty<Principal, Text>();
      userProfiles = Map.empty<Principal, { name : Text }>();
    };
  };
};

