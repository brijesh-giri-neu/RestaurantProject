export type AuthStackParamList = {
  Login: undefined;
  Signup: undefined;
};

export type AppStackParamList = {
  Home: undefined;
  AddVisit: undefined;
  Lookup: undefined;
  BrowseVisits: undefined;
  EditVisit: { visitId: string };
};
