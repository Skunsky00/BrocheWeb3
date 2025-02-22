import { Navigate, Route, Routes } from "react-router-dom";
import AuthPage from "./pages/AuthPage/AuthPage";
import HomePage from "./pages/HomePage/HomePage";
import PageLayout from "./Layouts/PageLayout/PageLayout";
import ProfilePage from "./pages/ProfilePage/ProfilePage";
import PostPage from "./pages/PostPage/PostPage";
import { auth } from "./firebase/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { useState, useEffect } from "react";
import SplashScreen from "./components/SplashScreen/SplashScreen";

function App() {
  const [authUser] = useAuthState(auth);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Keep loading content while showing the splash screen
    const timer = setTimeout(() => setIsLoading(false), 2000); // Show for 2.0s
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      {/* Pass `isLoading` to control the fade-out */}
      <SplashScreen isVisible={isLoading} />

      {/* Render the main app immediately, even if loading */}
      <PageLayout>
        <Routes>
          <Route
            path="/"
            element={authUser ? <HomePage /> : <Navigate to="/auth" />}
          />
          <Route
            path="/auth"
            element={!authUser ? <AuthPage /> : <Navigate to="/" />}
          />
          <Route path="/:username" element={<ProfilePage />} />
          <Route path="/p/:postId" element={<PostPage />} />
        </Routes>
      </PageLayout>
    </>
  );
}

export default App;
