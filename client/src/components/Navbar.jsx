import React, { useEffect, useState } from "react";
import styled from "styled-components";
import AccountCircleOutlinedIcon from "@mui/icons-material/AccountCircleOutlined";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import VideoCallOutlinedIcon from "@mui/icons-material/VideoCallOutlined";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import Upload from "./Upload";
import { logout } from "../redux/userSlice";
import axios from "axios";

const Container = styled.div`
  position: sticky;
  top: 0;
  background-color: ${({ theme }) => theme.bgLighter};
  height: 56px;
`;

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  height: 100%;
  padding: 0px 20px;
  position: relative;
`;

const Search = styled.div`
  width: 40%;
  position: absolute;
  left: 0px;
  right: 0px;
  margin: auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 5px;
  border: 1px solid #ccc;
  border-radius: 3px;
`;

const Input = styled.input`
  border: none;
  background-color: transparent;
  outline: none;
  color: ${({ theme }) => theme.text};
`;

const Button = styled.button`
  font-size: 14px;
  padding: 5px 10px;
  background-color: transparent;
  border: 1px solid #ff2b2b;
  color: #ff2b2b;
  border-radius: 5px;
  font-weight: 500;
  cursor: pointer;
  margin-left: 10px;
`;

const User = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 500;
  color: ${({ theme }) => theme.text};
`;

const Avatar = styled.img`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: #999;
`;

const UserAvatar = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: #999;
  cursor: pointer;
`;

const UserMenu = styled.div`
  position: absolute;
  top: 56px;
  right: 20px;
  background-color: ${({ theme }) => theme.bgLighter};
  border-radius: 5px;
  padding: 10px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.3);
`;

const NotificationsMenu = styled.div`
  position: absolute;
  top: 56px;
  right: 20px;
  background-color: ${({ theme }) => theme.bgLighter};
  border-radius: 5px;
  padding: 10px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.3);
  z-index: 999;

  h3 {
    font-size: 16px;
    font-weight: bold;
    margin-bottom: 10px;
  }

  ul {
    list-style: none;
    margin: 0;
    padding: 0;
    max-height: 200px;
    overflow: auto;
  }

  li {
    margin-bottom: 5px;
    font-size: 14px;
    cursor: pointer;
    color: #f00;
    transition: all 0.2s ease-in-out;

    &:hover {
      color: #333;
      text-decoration: underline;
    }
  }
`;

const Navbar = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const { currentUser } = useSelector((state) => state.user);
  const [menuOpen, setMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [videos, setVideos] = useState([]);
  const [comments, setComments] = useState([]);
  const [searchMode, setSearchMode] = useState("title"); // "title" or "tags"

  useEffect(() => {
    const fetchVideosAndComments = async () => {
      try {
        const responseVideos = await axios.get("/videos");
        setVideos(responseVideos.data);
        const userId = currentUser ? currentUser._id : null;
        const userVideos = videos.filter((video) => video.userId === userId);
        const videoIds = userVideos.map((video) => video._id);
        const commentPromises = videoIds.map((videoId) =>
          axios.get(`/comments/${videoId}`)
        );
        const responseComments = await Promise.all(commentPromises);
        const filteredComments = responseComments
          .map((response) => response.data)
          .flat()
          .filter((comment) => videoIds.includes(comment.videoId));
        setComments(filteredComments);
      } catch (err) {
        console.error(err);
      }
    };
    fetchVideosAndComments();
  }, [videos, currentUser]);

  const handleUserClick = () => {
    setMenuOpen(!menuOpen);
    setNotificationsOpen(false); // Close notifications
  };

  const handleNotificationsClick = () => {
    setNotificationsOpen(!notificationsOpen);
    setMenuOpen(false); // Close menu
  };

  const handleLogout = async (e) => {
    e.preventDefault();
    dispatch(logout());
    await axios.post("/auth/logout");
    window.location.href = "/";
  };

  const handleSearch = () => {
    navigate(`/search?q=${q}&type=${searchMode}`);
  };

  const toggleSearchMode = () => {
    setSearchMode((prevMode) => (prevMode === "title" ? "tags" : "title"));
  };

  return (
    <>
      <Container>
        <Wrapper>
          <Search>
            <Input
              placeholder="Search"
              onChange={(e) => setQ(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  handleSearch();
                }
              }}
            />
            <SearchOutlinedIcon style={{ color: "red" }} onClick={handleSearch} />
            <Button onClick={toggleSearchMode}>
              {searchMode === "title" ? "Searching by Titles" : "Searching by Tags"}
            </Button>
          </Search>
          {currentUser ? (
            <User>
              <VideoCallOutlinedIcon
                style={{ cursor: "pointer", fontSize: "35px" }}
                onClick={() => setOpen(true)}
              />
              <NotificationsNoneIcon
                style={{ cursor: "pointer", fontSize: "35px" }}
                onClick={handleNotificationsClick}
              />
              <UserAvatar onClick={handleUserClick}>
                <Avatar src={currentUser.img} />
              </UserAvatar>
              {currentUser.name}
              {notificationsOpen && (
                <NotificationsMenu>
                  <h3>New comments:</h3>
                  <ul>
                    {comments.map((comment) => (
                      <li
                        key={comment._id}
                        onClick={() => navigate(`/video/${comment.videoId}`)}
                      >
                        {comment.desc}
                      </li>
                    ))}
                  </ul>
                </NotificationsMenu>
              )}
              {menuOpen && (
                <UserMenu>
                  <Button
                    onClick={() =>
                      navigate(`/users/panel/${currentUser._id}`, {
                        state: { userId: currentUser._id },
                      })
                    }
                  >
                    User Panel
                  </Button>
                  <Button
                    onClick={() =>
                      navigate(`/users/find/${currentUser._id}`, {
                        state: { userId: currentUser._id },
                      })
                    }
                  >
                    Your Channel
                  </Button>
                  <Button>Help</Button>
                  <Button>Settings</Button>
                  <Button onClick={handleLogout}>Logout</Button>
                </UserMenu>
              )}
            </User>
          ) : (
            <Link to="signin" style={{ textDecoration: "none" }}>
              <Button>
                <AccountCircleOutlinedIcon />
                Sign in
              </Button>
            </Link>
          )}
        </Wrapper>
      </Container>
      {open && <Upload setOpen={setOpen} />}
    </>
  );
};

export default Navbar;
