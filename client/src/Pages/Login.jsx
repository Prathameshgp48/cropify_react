import axios from 'axios';
import { useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const endpoint = isLogin ? 'login' : 'signup';
    const payload = isLogin ? { email, password } : { name, email, password };

    try {
      const res = await axios.post(`http://localhost:5000/${endpoint}`, payload);
      localStorage.setItem('token', res.data.token);

      const userName = isLogin ? res.data.name : name;
      localStorage.setItem('username', "Nimish Padwal");

      toast.success(`${isLogin ? 'Login' : 'Signup'} successful!`);

      setTimeout(() => {
        navigate('/crop-recommendation');
        window.location.reload(); // reload the page
      }, 1500); // wait for the toast to appear
    } catch (err) {
      toast.error(`${isLogin ? 'Login' : 'Signup'} failed!`);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-green-900 text-white">
      <ToastContainer />
      <div className="bg-white bg-opacity-10 backdrop-blur-sm p-8 rounded-xl shadow-lg w-full max-w-md">
        <h2 className="text-3xl font-bold mb-6 text-center text-yellow-400">
          {isLogin ? 'Login to CropiFy' : 'Sign Up to CropiFy'}
        </h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {!isLogin && (
            <input
              type="text"
              onChange={(e) => setName(e.target.value)}
              placeholder="Full Name"
              required
              className="p-3 rounded-md bg-green-100 text-black placeholder-gray-600"
            />
          )}
          <input
            type="email"
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            required
            className="p-3 rounded-md bg-green-100 text-black placeholder-gray-600"
          />
          <input
            type="password"
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            required
            className="p-3 rounded-md bg-green-100 text-black placeholder-gray-600"
          />
          <button
            type="submit"
            className="bg-yellow-400 hover:bg-yellow-500 text-black font-semibold py-2 rounded-md transition"
          >
            {isLogin ? 'Login' : 'Sign Up'}
          </button>
        </form>
        <p className="mt-4 text-center">
          {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-yellow-300 underline hover:text-yellow-500 transition"
          >
            {isLogin ? 'Sign up' : 'Login'}
          </button>
        </p>
      </div>
    </div>
  );
}

export default Login;
