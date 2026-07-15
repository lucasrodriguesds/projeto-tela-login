const signIn = async (email, password) => {
  return await window.auth.signInWithEmailAndPassword(email, password);
};

const signUp = async (email, password) => {
  return await window.auth.createUserWithEmailAndPassword(email, password);
};
