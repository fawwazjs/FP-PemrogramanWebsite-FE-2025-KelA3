// App.tsx

import { Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import Register from "./pages/Register";
import Sandbox from "./pages/Sandbox";
import Login from "./pages/Login";
import ProfilePage from "./pages/ProfilePage";
import MyProjectsPage from "./pages/MyProjectsPage";
import CreateQuiz from "./pages/CreateQuiz";
import CreateProject from "./pages/CreateProject";
import EditQuiz from "./pages/EditQuiz";
import Quiz from "./pages/Quiz";
import ProtectedRoute from "./routes/ProtectedRoutes";

import PairOrNoPairGame from "./pages/pair-or-no-pair";
import CreatePairOrNoPair from "./pages/pair-or-no-pair/create";

import FlashCardCreatePage from "./pages/flash-card/create";
import FlashCardPlayPage from "./pages/flash-card/play";
import FlashCardEditPage from "./pages/flash-card/edit";

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/sandbox" element={<Sandbox />} />
        <Route path="/quiz/play/:id" element={<Quiz />} />

        <Route
          path="/pair-or-no-pair/play/:gameId"
          element={<PairOrNoPairGame />}
        />

        <Route
          path="/flash-card/play/:gameId"
          element={<FlashCardPlayPage />}
        />

        {/* Protected Area */}
        <Route element={<ProtectedRoute />}>
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/my-projects" element={<MyProjectsPage />} />
          <Route path="/create-projects" element={<CreateProject />} />
          <Route path="/create-quiz" element={<CreateQuiz />} />
          <Route
            path="/create-pair-or-no-pair"
            element={<CreatePairOrNoPair />}
          />
          <Route path="/quiz/edit/:id" element={<EditQuiz />} />

          <Route
            path="/create-flash-cards"
            element={<FlashCardCreatePage />}
          />
          <Route
            path="/flash-card/edit/:id"
            element={<FlashCardEditPage />}
          />
        </Route>
      </Routes>
    </>
  );
}

export default App;
