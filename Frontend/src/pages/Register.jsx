

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Register = () => {
  const [theme, setTheme] = useState(() => {
    const t = localStorage?.getItem("site-theme");
    return t || (window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark");
  });

  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirm: "",
  });


  useEffect(() => {
    const html = document.documentElement;
    html.classList.remove("light", "dark");
    html.classList.add(theme);
    try {
      localStorage.setItem("site-theme", theme);
    } catch {}
  }, [theme]);


  const getPasswordStrength = (pwd) => {
    if (!pwd) return 0;
    let strength = 0;
    if (pwd.length >= 6) strength++;
    if (pwd.length >= 10) strength++;
    if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) strength++;
    if (/\d/.test(pwd)) strength++;
    if (/[!@#$%^&*]/.test(pwd)) strength++;
    return strength;
  };


  const validateForm = () => {
    const newErrors = {};
    if (!formData.firstName) {
      newErrors.firstName = "First name required";
    }
    if (!formData.lastName) {
      newErrors.lastName = "Last name required";
    }
    if (!formData.email) {
      newErrors.email = "Email required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email";
    }
    if (!formData.password) {
      newErrors.password = "Password required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Min 6 chars";
    }
    if (!formData.confirm) {
      newErrors.confirm = "Confirm required";
    } else if (formData.confirm !== formData.password) {
      newErrors.confirm = "Passwords do not match";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsSubmitting(true);

    try {
      // AXIOS :-
      axios.post("https://chat-gpt-1-szav.onrender.com/api/auth/register",
        {
          fullName: {
            firstName: formData.firstName,
            lastName: formData.lastName
          },
          email: formData.email,
          password: formData.password,
        },
        {
          // FOR PASSING COOKIES IN BROWSER :-
          withCredentials: true,
        }
      ).then((res) => {
        console.log(res);
        console.log("Register payload:", formData);
        navigate("/login")
      }).catch((err) => {
        console.log(err);
        alert("Registration failed")
      })

      
      // EMPTY THE FORM DATA AFTER REGISTRATION :-
      await new Promise((r) => setTimeout(r, 800));
      setSuccess(true);
      setFormData({ firstName: "", lastName: "", email: "", password: "", confirm: "" });
      setTimeout(() => {
        // navigate("/login"); - Uncomment in your project
      }, 2000);
    } catch (err) {
      console.log(err);
      if (err.response?.data?.message) {
        setErrors({ submit: err.response.data.message });
      }
    } finally {
      setIsSubmitting(false);
    }
  };


  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };


  const passwordStrength = getPasswordStrength(formData.password);
  const strengthLabels = ["None", "Weak", "Fair", "Good", "Strong"];
  const strengthColors = ["bg-gray-300", "bg-red-400", "bg-orange-400", "bg-yellow-400", "bg-green-400"];


  return (
    <div className={theme}>
      {/* Theme Toggle */}
      <div className="fixed top-5 right-5 flex gap-2 bg-white/20 dark:bg-slate-900/70 backdrop-blur-md p-2 rounded-2xl border border-cyan-200/40 dark:border-slate-700 shadow-lg">
        <button
          onClick={() => setTheme("light")}
          className={`w-11 h-10 rounded-lg transition-all ${
            theme === "light"
              ? "bg-gradient-to-br from-blue-500 to-cyan-500 text-white shadow-lg"
              : "text-gray-500 hover:text-gray-700 dark:text-gray-400"
          }`}
          title="Light mode"
        >
          ☀️
        </button>
        <button
          onClick={() => setTheme("dark")}
          className={`w-11 h-10 rounded-lg transition-all ${
            theme === "dark"
              ? "bg-gradient-to-br from-purple-600 to-pink-500 text-white shadow-lg"
              : "text-gray-500 hover:text-gray-700 dark:text-gray-400"
          }`}
          title="Dark mode"
        >
          🌙
        </button>
      </div>


      {/* Main Container */}
      <div className="min-h-screen bg-gradient-to-br from-slate-500 via-cyan-400 to-slate-500 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-6">
        <div
          onSubmit={handleSubmit}
          className="w-full max-w-md bg-white/70 dark:bg-slate-800 rounded-2xl shadow-xl dark:shadow-2xl p-8 border border-cyan-200/50 dark:border-slate-700 backdrop-blur-sm animate-in fade-in slide-in-from-bottom-4 duration-500"
        >
          {/* Header */}
          <div className="flex gap-4 items-center mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-xl flex items-center justify-center text-white text-xl font-bold shadow-lg">
              ✨
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Create account</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">Join us today</p>
            </div>
          </div>

          {/* Error Message */}
          {errors.submit && <p className="text-sm text-red-500 mb-4">{errors.submit}</p>}

          {/* Name Fields */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            {/* First Name */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wide mb-2">
                First name
              </label>
              <input
                type="text"
                name="firstName"
                placeholder="John"
                value={formData.firstName}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-slate-100/80 dark:bg-slate-700 border border-cyan-200/60 dark:border-slate-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all"
              />
              {errors.firstName && <p className="text-xs text-red-500 mt-1">{errors.firstName}</p>}
            </div>



            {/* Last Name */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wide mb-2">
                Last name
              </label>
              <input
                type="text"
                name="lastName"
                placeholder="Doe"
                value={formData.lastName}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-slate-100/80 dark:bg-slate-700 border border-cyan-200/60 dark:border-slate-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all"
              />
              {errors.lastName && <p className="text-xs text-red-500 mt-1">{errors.lastName}</p>}
            </div>
          </div>


          {/* Email */}
          <div className="mb-4">
            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wide mb-2">
              Email address
            </label>
            <input
              type="email"
              name="email"
              placeholder="you@example.com"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-slate-100/80 dark:bg-slate-700 border border-cyan-200/60 dark:border-slate-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all"
            />
            {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
          </div>


          {/* Password Fields */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wide mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-slate-100/80 dark:bg-slate-700 border border-cyan-200/60 dark:border-slate-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                >
                  {showPassword ? "👁️" : "👁️‍🗨️"}
                </button>
              </div>
              {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
              {formData.password && (
                <div className="mt-2">
                  <div className="h-1.5 bg-slate-200 dark:bg-slate-600 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all ${strengthColors[passwordStrength]}`}
                      style={{ width: `${(passwordStrength / 5) * 100}%` }}
                    />
                  </div>
                  <p className="text-xs text-slate-600 dark:text-gray-400 mt-1">
                    Strength: <span className="font-semibold">{strengthLabels[passwordStrength]}</span>
                  </p>
                </div>
              )}
            </div>


            {/* Confirm Password */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wide mb-2">
                Confirm password
              </label>
              <div className="relative">
                <input
                  type={showConfirm ? "text" : "password"}
                  name="confirm"
                  placeholder="••••••••"
                  value={formData.confirm}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-slate-100/80 dark:bg-slate-700 border border-cyan-200/60 dark:border-slate-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                >
                  {showConfirm ? "👁️" : "👁️‍🗨️"}
                </button>
              </div>
              {errors.confirm && <p className="text-xs text-red-500 mt-1">{errors.confirm}</p>}
            </div>
          </div>


          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 dark:from-purple-600 dark:to-purple-700 dark:hover:from-purple-700 dark:hover:to-purple-800 text-white font-bold py-3 px-4 rounded-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-70 disabled:cursor-not-allowed mt-6"
          >
            {isSubmitting ? "Creating..." : "Register"}
          </button>


          {/* Login Link */}
          <p className="text-center text-sm text-gray-900 dark:text-gray-400 mt-4">
            Already have an account?{" "}
            <button
              type="button"
              onClick={() => navigate("/login")}
              className="text-blue-600 dark:text-purple-400 font-semibold hover:underline"
            >
              Sign in
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;