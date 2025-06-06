// KEY used in localStorage
const USERS_KEY = 'users';

// Register user and store in array
export const registerUser = async (data) => {
  if (!data.username || !data.password) {
    throw new Error('Username and password are required');
  }

  const users = JSON.parse(localStorage.getItem(USERS_KEY)) || [];

  // Check if username/email already exists
  const exists = users.find(
    (u) => u.username === data.username || u.email === data.email
  );
  if (exists) {
    throw new Error('Username or email already registered');
  }

  const encryptedUser = {
    ...data,
    password: btoa(data.password), // Encode password (simple Base64)
  };

  users.push(encryptedUser);
  localStorage.setItem(USERS_KEY, JSON.stringify(users));

  return { success: true };
};

// Login by checking username and matching encoded password
export const loginUser = async (form) => {
  const users = JSON.parse(localStorage.getItem(USERS_KEY)) || [];

  const user = users.find(
    (u) =>
      u.username === form.username &&
      btoa(form.password) === u.password // Encode input password for comparison
  );

  if (user) {
    return user; // full user object
  } else {
    throw new Error('Invalid username or password');
  }
};
