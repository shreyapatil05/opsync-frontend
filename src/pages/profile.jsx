import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Eye, EyeOff, MapPin, Clock, Briefcase, Mail, Camera, AlertCircle, CheckCircle, Edit2 } from "lucide-react";
import { useAuth } from '../contexts/AuthContext';

const Profile = () => {
  const API_URL = "http://https://opsync.onrender.co/api";

  
  const [personalInfo, setPersonalInfo] = useState({
    name: "",
    email: "",
    phone: "",
    bio: "",
    location: ""
  });
  const [avatarUrl, setAvatarUrl] = useState("");
  const [isSavingPersonal, setIsSavingPersonal] = useState(false);
  const [personalSaveMessage, setPersonalSaveMessage] = useState("");
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [isEditing, setIsEditing] = useState(false);


  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState("");

  
  const [lastLogin, setLastLogin] = useState("");
  const [currentDateTime, setCurrentDateTime] = useState({
    date: "",
    time: "",
    timezone: ""
  });


  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await fetch(`${API_URL}/auth/profile`, {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
          setPersonalInfo({
            name: userData.name || "",
            email: userData.email || "",
            phone: userData.phone || "",
            bio: userData.bio || "",
            location: userData.location || ""
          });
          setAvatarUrl(userData.avatar || "");
          if (userData.lastLogin) {
            setLastLogin(new Date(userData.lastLogin).toLocaleString());
          }
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

 
  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      setCurrentDateTime({
        date: now.toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }),
        time: now.toLocaleTimeString('en-US'),
        timezone: timezone
      });
    };

    updateDateTime();
    const interval = setInterval(updateDateTime, 1000);
    return () => clearInterval(interval);
  }, []);

 
  const handlePersonalInfoChange = (e) => {
    const { name, value } = e.target;
    setPersonalInfo(prev => ({
      ...prev,
      [name]: value
    }));
  };

  
  const uploadAvatarToCloudinary = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'your_upload_preset');

    try {
      const response = await fetch('https://api.cloudinary.com/v1_1/your_cloud_name/image/upload', {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        return data.secure_url;
      }
    } catch (error) {
      console.error('Error uploading to Cloudinary:', error);
      throw error;
    }
  };

  
  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploadingAvatar(true);
      try {
        const url = await uploadAvatarToCloudinary(file);
        setAvatarUrl(url);
        await saveProfileWithAvatar(url);
      } catch (error) {
        setPersonalSaveMessage("✗ Error uploading avatar");
      } finally {
        setIsUploadingAvatar(false);
      }
    }
  };

  
  const saveProfileWithAvatar = async (avatarUrl) => {
    try {
      const response = await fetch(`${API_URL}/auth/profile`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...personalInfo,
          avatar: avatarUrl
        })
      });

      if (response.ok) {
        const updatedUser = await response.json();
        setUser(updatedUser);
        setPersonalInfo({
          name: updatedUser.name || "",
          email: updatedUser.email || "",
          phone: updatedUser.phone || "",
          bio: updatedUser.bio || "",
          location: updatedUser.location || ""
        });
        setPersonalSaveMessage("✓ Avatar uploaded successfully!");
        setTimeout(() => setPersonalSaveMessage(""), 3000);
      }
    } catch (error) {
      console.error('Error saving avatar:', error);
    }
  };

  
  const handleSavePersonalInfo = async () => {
    setIsSavingPersonal(true);
    try {
      const response = await fetch(`${API_URL}/auth/profile`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: personalInfo.name,
          email: personalInfo.email,
          phone: personalInfo.phone,
          bio: personalInfo.bio,
          location: personalInfo.location,
          avatar: avatarUrl
        })
      });

      if (response.ok) {
        const updatedUser = await response.json();
        
        setUser(updatedUser);
        setPersonalInfo({
          name: updatedUser.name || "",
          email: updatedUser.email || "",
          phone: updatedUser.phone || "",
          bio: updatedUser.bio || "",
          location: updatedUser.location || ""
        });
        setAvatarUrl(updatedUser.avatar || "");
        setPersonalSaveMessage("✓ Profile saved successfully!");
        setTimeout(() => setPersonalSaveMessage(""), 3000);
        
        setIsEditing(false);
      } else {
        setPersonalSaveMessage("✗ Error saving profile");
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      setPersonalSaveMessage("✗ Error saving profile");
    } finally {
      setIsSavingPersonal(false);
    }
  };

  
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  
  const handleSavePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordMessage("✗ Passwords don't match!");
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setPasswordMessage("✗ Password must be at least 6 characters!");
      return;
    }

    setIsChangingPassword(true);
    try {
      const response = await fetch(`${API_URL}/auth/change-password`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        })
      });

      if (response.ok) {
        setPasswordMessage("✓ Password changed successfully!");
        setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
        setTimeout(() => setPasswordMessage(""), 3000);
      } else {
        const error = await response.json();
        setPasswordMessage(`✗ ${error.error || 'Error changing password'}`);
      }
    } catch (error) {
      console.error('Error changing password:', error);
      setPasswordMessage("Error changing password");
    } finally {
      setIsChangingPassword(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl text-muted-foreground">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-hero p-6">
      <div className="mx-auto max-w-5xl">
        
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-2">
            User Profile
          </h1>
          <p className="text-muted-foreground text-lg">Manage your account settings and preferences</p>
        </div>

       
        <div className="bg-gradient-card rounded-xl p-8 shadow-card border mb-6">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            
            <div className="relative group">
              <Avatar className="h-32 w-32 border-4 border-primary/20">
                <AvatarImage src={avatarUrl} alt={personalInfo.name} />
                <AvatarFallback className="text-2xl bg-primary/10">
                  {personalInfo.name
                    .split(" ")
                    .map(n => n[0])
                    .join("")
                    .toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <label
                htmlFor="avatar-upload"
                className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
              >
                <Camera className="h-8 w-8 text-white" />
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarChange}
                  disabled={isUploadingAvatar}
                />
              </label>
              {isUploadingAvatar && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-full">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-white"></div>
                </div>
              )}
            </div>

            
            <div className="flex-1">
              <h2 className="text-3xl font-bold mb-2">{personalInfo.name}</h2>
              <div className="flex flex-wrap gap-3 mb-4">
                <Badge className="bg-primary/10 text-primary border-primary/20 px-3 py-1">
                  <Briefcase className="h-3 w-3 mr-1" />
                  {user?.role || "User"}
                </Badge>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Mail className="h-4 w-4" />
                <span>{personalInfo.email}</span>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Member since {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long' }) : 'Recently'}
              </p>
            </div>
          </div>
        </div>

        
        <Tabs defaultValue="personal" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 h-auto p-1 bg-card border shadow-sm">
            <TabsTrigger value="personal" className="py-3">Personal Info</TabsTrigger>
            <TabsTrigger value="security" className="py-3">Security</TabsTrigger>
            <TabsTrigger value="activity" className="py-3">Activity</TabsTrigger>
          </TabsList>

          
          <TabsContent value="personal">
            <Card className="p-6 shadow-card border bg-gradient-card space-y-6">
             
              {isEditing ? (
               
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="block text-sm font-medium">Full Name</label>
                      <input
                        type="text"
                        name="name"
                        value={personalInfo.name}
                        onChange={handlePersonalInfoChange}
                        placeholder="Enter your full name"
                        className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-background"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-medium">Email</label>
                      <input
                        type="email"
                        name="email"
                        value={personalInfo.email}
                        onChange={handlePersonalInfoChange}
                        placeholder="Enter your email"
                        className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-background"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="block text-sm font-medium">Phone Number</label>
                      <input
                        type="tel"
                        name="phone"
                        value={personalInfo.phone}
                        onChange={handlePersonalInfoChange}
                        placeholder="Enter your phone number"
                        className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-background"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-medium">Location</label>
                      <input
                        type="text"
                        name="location"
                        value={personalInfo.location}
                        onChange={handlePersonalInfoChange}
                        placeholder="Your location"
                        className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-background"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium">Bio</label>
                    <textarea
                      name="bio"
                      value={personalInfo.bio}
                      onChange={handlePersonalInfoChange}
                      placeholder="Tell us about yourself..."
                      rows="4"
                      className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-background"
                    />
                  </div>

                  {personalSaveMessage && (
                    <div className={`flex items-center gap-3 p-4 rounded-lg ${
                      personalSaveMessage.includes('✓')
                        ? 'bg-accent/10 text-accent border border-accent/20'
                        : 'bg-destructive/10 text-destructive border border-destructive/20'
                    }`}>
                      {personalSaveMessage.includes('✓') ? (
                        <CheckCircle className="h-5 w-5" />
                      ) : (
                        <AlertCircle className="h-5 w-5" />
                      )}
                      {personalSaveMessage}
                    </div>
                  )}

                  <Button
                    onClick={handleSavePersonalInfo}
                    disabled={isSavingPersonal}
                    className="w-full"
                  >
                    {isSavingPersonal ? "Saving..." : "Save Changes"}
                  </Button>
                </>
              ) : (
                
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">Full Name</p>
                      <p className="text-lg font-semibold">{personalInfo.name || "Not set"}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">Email</p>
                      <p className="text-lg font-semibold">{personalInfo.email || "Not set"}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">Phone Number</p>
                      <p className="text-lg font-semibold">{personalInfo.phone || "Not set"}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">Location</p>
                      <p className="text-lg font-semibold">{personalInfo.location || "Not set"}</p>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Bio</p>
                    <p className="text-lg font-semibold">{personalInfo.bio || "Not set"}</p>
                  </div>
                  <Button onClick={() => setIsEditing(true)} className="w-full">
                    <Edit2 className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Button>
                </>
              )}
            </Card>
          </TabsContent>

         
          <TabsContent value="security">
            <Card className="p-6 shadow-card border bg-gradient-card space-y-6">
              <h3 className="text-lg font-semibold">Change Password</h3>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium">Current Password</label>
                  <div className="relative">
                    <input
                      type={showPasswords.current ? "text" : "password"}
                      name="currentPassword"
                      value={passwordData.currentPassword}
                      onChange={handlePasswordChange}
                      placeholder="Enter current password"
                      className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-background pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords(prev => ({
                        ...prev,
                        current: !prev.current
                      }))}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPasswords.current ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium">New Password</label>
                  <div className="relative">
                    <input
                      type={showPasswords.new ? "text" : "password"}
                      name="newPassword"
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                      placeholder="Enter new password"
                      className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-background pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords(prev => ({
                        ...prev,
                        new: !prev.new
                      }))}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPasswords.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium">Confirm Password</label>
                  <div className="relative">
                    <input
                      type={showPasswords.confirm ? "text" : "password"}
                      name="confirmPassword"
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordChange}
                      placeholder="Confirm new password"
                      className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-background pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords(prev => ({
                        ...prev,
                        confirm: !prev.confirm
                      }))}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPasswords.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </div>

              {passwordMessage && (
                <div className={`flex items-center gap-3 p-4 rounded-lg ${
                  passwordMessage.includes('✓')
                    ? 'bg-accent/10 text-accent border border-accent/20'
                    : 'bg-destructive/10 text-destructive border border-destructive/20'
                }`}>
                  {passwordMessage.includes('✓') ? (
                    <CheckCircle className="h-5 w-5" />
                  ) : (
                    <AlertCircle className="h-5 w-5" />
                  )}
                  {passwordMessage}
                </div>
              )}

              <Button
                onClick={handleSavePassword}
                disabled={isChangingPassword}
                className="w-full"
              >
                {isChangingPassword ? "Updating..." : "Update Password"}
              </Button>
            </Card>
          </TabsContent>

         
          <TabsContent value="activity">
            <div className="space-y-6">
             
              <Card className="p-6 shadow-card border bg-gradient-card">
                <h3 className="text-lg font-semibold mb-4">Current Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-card p-4 rounded-lg border border-border">
                    <p className="text-sm text-muted-foreground mb-1">Date</p>
                    <p className="text-lg font-semibold">{currentDateTime.date}</p>
                  </div>
                  <div className="bg-card p-4 rounded-lg border border-border">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                      <Clock className="h-4 w-4" />
                      Time
                  </div>
                  <p className="text-lg font-semibold">{currentDateTime.time}</p>
                </div>
                  <div className="bg-card p-4 rounded-lg border border-border">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                      <MapPin className="h-4 w-4" />
                      Timezone
                  </div>
                  <p className="text-lg font-semibold">{currentDateTime.timezone}</p>
                </div>
              </div>
            </Card>

            {lastLogin && (
              <Card className="p-6 shadow-card border bg-gradient-card">
                <h3 className="text-lg font-semibold mb-3">Last Login</h3>
                <p className="text-muted-foreground">{lastLogin}</p>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
      </div>
    </div>
  );
};

export default Profile;
