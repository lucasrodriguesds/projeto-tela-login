const signIn = async (email, password) => {
  return await auth.signInWithEmailAndPassword(email, password);
};

const signUp = async (email, password) => {
  return await auth.createUserWithEmailAndPassword(email, password);
};
