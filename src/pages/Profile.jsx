import { useAuth } from '../context/useAuth';


const Profile = () => {
  const { user } = useAuth();

  if (!user) {
    return (
      <div style={{ color: 'white', padding: '2rem' }}>
        <h2>Profile</h2>
        <p>No user data found. Please log in.</p>
      </div>
    );
  }

  return (
    <div style={{ color: 'white', padding: '2rem' }}>
      <h2>Profile</h2>
      <p><strong>First Name:</strong> {user.firstName}</p>
      <p><strong>Last Name:</strong> {user.lastName}</p>
      <p><strong>Username:</strong> {user.username}</p>
      <p><strong>Email:</strong> {user.email}</p>
    </div>
  );
};

export default Profile;
