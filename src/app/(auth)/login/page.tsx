'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useAuth, UserRole } from '@/contexts/AuthContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('Founder'); // Default role
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isDevelopment, setIsDevelopment] = useState(false);
  const { login } = useAuth();

  // Check if we're running on localhost (development environment)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname;
      setIsDevelopment(hostname === 'localhost' || hostname === '127.0.0.1');
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate credentials
    if (login(email, password, role)) {
      // Successful login - redirect happens in ProtectedRoute
      setError('');
    } else {
      // Failed login
      setError('Invalid email or password.');
    }
  };

  // Role options
  const roleOptions = [
    { value: 'Founder', label: 'Founder' },
    { value: 'Tech Lead', label: 'Tech Lead' },
    { value: 'Telecaller', label: 'Telecaller' }
  ];

  // Valid credentials for each role (for development/testing)
  const validCredentials = {
    'Founder': {
      email: 'founder@raulo.com',
      password: 'founder123'
    },
    'Tech Lead': {
      email: 'techlead@raulo.com',
      password: 'techlead123'
    },
    'Telecaller': {
      email: 'telecaller@raulo.com',
      password: 'telecaller123'
    }
  };

  const fillCredentials = (role: UserRole) => {
    const creds = validCredentials[role];
    if (creds) {
      setEmail(creds.email);
      setPassword(creds.password);
      setRole(role);
    }
  };

  return (
    // Added ml-0 to override the main layout margin for login page
    <div className="ml-0 flex min-h-screen bg-[#F5F7FA] font-sans">
      {/* Left Panel - Brand Identity */}
      <div 
        className="w-[45%] pt-[110px] pl-[120px] pr-[60px] flex flex-col items-start"
      >
        {/* Using the logo.png from public/assets */}
        <div className="mb-6">
          <Image 
            src=".public/assets/logo.png" 
            alt="Raulo Ent. Logo" 
            width={48} 
            height={48}
            className="rounded-lg"
          />
        </div>
        
        <h1 className="text-[36px] font-bold text-[#0F172A] leading-[44px]">Raulo Ent.</h1>
        
        <h2 className="text-[20px] font-medium text-[#475569] mt-[10px]">
          The Core of Your Business Operations
        </h2>
        
        <p className="text-[16px] leading-[26px] font-normal text-[#64748B] max-w-[480px] mt-[12px]">
          Streamline your processes, enhance productivity,<br />
          and drive growth with our all-in-one enterprise solution.
        </p>
        
        <div className="mt-[40px] w-[440px] h-[260px] bg-gradient-to-br from-[#FED7D7] to-[#FEEBC8] rounded-[14px] flex items-center justify-center">
          <div className="relative w-[380px] h-[200px]">
            {/* Table surface */}
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-[280px] h-[80px] bg-white rounded-lg shadow-sm"></div>
            
            {/* Notebook */}
            <div className="absolute bottom-[40px] left-1/2 transform -translate-x-1/2 w-[180px] h-[120px] bg-white rounded-md shadow-sm"></div>
            
            {/* Plant pot */}
            <div className="absolute bottom-[50px] left-[calc(50%-120px)] w-[60px] h-[80px]">
              <div className="w-[60px] h-[40px] bg-[#10B981] rounded-full"></div>
              <div className="w-[40px] h-[50px] bg-[#92400E] mx-auto mt-[-10px] rounded-b-lg"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div 
        className="w-[55%] bg-white pt-[110px] pl-[100px] pr-[140px] flex flex-col"
      >
        <h1 className="text-[32px] font-bold text-[#0F172A] tracking-[-0.5px]">
          Log In to Your Account
        </h1>
        
        <p className="text-[16px] text-[#64748B] mt-[6px] mb-[24px]">
          Welcome back to Raulo Ent.
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="w-full">
          {/* Role Selection */}
          <div className="mb-[20px]">
            <label 
              htmlFor="role" 
              className="block text-[14px] font-medium text-[#475569] mb-[6px]"
            >
              Select Role
            </label>
            <select
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
              className="w-full h-[52px] bg-white border border-[#CBD5E1] rounded-[8px] pl-[16px] text-[16px] text-[#0F172A] placeholder-[#94A3B8] focus:border-[#2563EB] focus:outline-none focus:ring-[3px] focus:ring-[#2563EB]/[0.15]"
            >
              {roleOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Email Field */}
          <div className="mb-[20px]">
            <label 
              htmlFor="email" 
              className="block text-[14px] font-medium text-[#475569] mb-[6px]"
            >
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full h-[52px] bg-white border border-[#CBD5E1] rounded-[8px] pl-[16px] text-[16px] text-[#0F172A] placeholder-[#94A3B8] focus:border-[#2563EB] focus:outline-none focus:ring-[3px] focus:ring-[#2563EB]/[0.15]"
              required
            />
          </div>

          {/* Password Field */}
          <div className="mb-[20px]">
            <label 
              htmlFor="password" 
              className="block text-[14px] font-medium text-[#475569] mb-[6px]"
            >
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full h-[52px] bg-white border border-[#CBD5E1] rounded-[8px] pl-[16px] pr-[50px] text-[16px] text-[#0F172A] placeholder-[#94A3B8] focus:border-[#2563EB] focus:outline-none focus:ring-[3px] focus:ring-[#2563EB]/[0.15]"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-[16px] top-1/2 transform -translate-y-1/2 text-[#94A3B8] hover:text-[#475569]"
              >
                {showPassword ? (
                  // Eye slash icon (when password is visible)
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-[22px] h-[22px]">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                  </svg>
                ) : (
                  // Eye icon (when password is hidden)
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-[22px] h-[22px]">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Remember Me & Forgot Password */}
          <div className="flex items-center justify-between mt-[10px] mb-[28px]">
            <div className="flex items-center">
              <input
                id="remember-me"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-[18px] h-[18px] border border-[#CBD5E1] rounded-[4px] text-[#2563EB] focus:ring-[#2563EB]"
              />
              <label 
                htmlFor="remember-me" 
                className="ml-[8px] text-[15px] text-[#475569]"
              >
                Remember me
              </label>
            </div>
            
            <a 
              href="#" 
              className="text-[15px] text-[#2563EB] hover:underline"
            >
              Forgot password?
            </a>
          </div>

          {/* Login Button */}
          <button
            type="submit"
            className="w-full h-[52px] bg-[#2563EB] rounded-[8px] text-[17px] font-semibold text-white hover:bg-[#1E40AF] transition-colors duration-180 ease-in-out mt-[10px]"
          >
            Log In
          </button>

        </form>

        {/* Valid Credentials Display for Development */}
        {isDevelopment && (
          <div className="mt-8 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800 mb-3 font-medium">Valid Credentials (Development Only):</p>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-blue-700">Founder:</span>
                <div className="flex space-x-2">
                  <span className="text-xs bg-blue-100 px-2 py-1 rounded">founder@raulo.com</span>
                  <span className="text-xs bg-blue-100 px-2 py-1 rounded">founder123</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-blue-700">Tech Lead:</span>
                <div className="flex space-x-2">
                  <span className="text-xs bg-blue-100 px-2 py-1 rounded">techlead@raulo.com</span>
                  <span className="text-xs bg-blue-100 px-2 py-1 rounded">techlead123</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-blue-700">Telecaller:</span>
                <div className="flex space-x-2">
                  <span className="text-xs bg-blue-100 px-2 py-1 rounded">telecaller@raulo.com</span>
                  <span className="text-xs bg-blue-100 px-2 py-1 rounded">telecaller123</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Quick Login Buttons for Development */}
        {isDevelopment && (
          <div className="mt-4">
            <p className="text-sm text-gray-500 mb-3 text-center">Quick Login (Development Only)</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => fillCredentials('Founder')}
                className="px-4 py-2 bg-green-100 text-green-800 rounded-lg text-sm font-medium hover:bg-green-200 transition-colors"
              >
                Fill Founder Creds
              </button>
              <button
                type="button"
                onClick={() => fillCredentials('Tech Lead')}
                className="px-4 py-2 bg-blue-100 text-blue-800 rounded-lg text-sm font-medium hover:bg-blue-200 transition-colors"
              >
                Fill Tech Lead Creds
              </button>
              <button
                type="button"
                onClick={() => fillCredentials('Telecaller')}
                className="px-4 py-2 bg-purple-100 text-purple-800 rounded-lg text-sm font-medium hover:bg-purple-200 transition-colors"
              >
                Fill Telecaller Creds
              </button>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-[32px]">
          <p className="text-[14px] text-[#94A3B8]">
            © 2024 Raulo Ent.. All Rights Reserved.
            <a 
              href="#" 
              className="text-[#2563EB] ml-[6px] hover:underline"
            >
              Help & Support
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}