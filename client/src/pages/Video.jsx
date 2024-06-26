import React, { useEffect, useState } from "react";
import styled from "styled-components";
import ThumbUpOutlinedIcon from "@mui/icons-material/ThumbUpOutlined";
import ThumbDownOffAltOutlinedIcon from "@mui/icons-material/ThumbDownOffAltOutlined";
import AccountCircleOutlined from "@mui/icons-material/AccountCircleOutlined";
import PlaylistAddIcon from "@mui/icons-material/PlaylistAdd";
import FlagCircleIcon from "@mui/icons-material/FlagCircle";
import AddTaskOutlinedIcon from "@mui/icons-material/AddTaskOutlined";
import ThumbDownIcon from "@mui/icons-material/ThumbDown";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import Comments from "../components/Comments";
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import { dislike, fetchSuccess, like } from "../redux/videoSlice.js";
import { subscription, librarySuccess, libraryFailure } from "../redux/userSlice";
import { format } from "timeago.js";
import Recommendation from "../components/Recommendation";
import UpdateVideo from "../components/UpdateVideo";
import ReportVideo from "../components/Report.jsx";
import PlaylistAdd from "../components/PlaylistAdd.jsx";

const Container = styled.div`
  display: flex;
  gap: 24px;
`;

const Content = styled.div`
  flex: 5;
`;
const VideoWrapper = styled.div``;

const Title = styled.h1`
  font-size: 22px;
  font-weight: 400;
  margin-top: 20px;
  margin-bottom: 10px;
  color: ${({ theme }) => theme.text};
`;

const Details = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const Desc = styled.div`
  display: flex;
  margin-top: 20px;
  color: ${({ theme }) => theme.text};
  background-color: #2f3440;
  border-radius: 20px;
`;

const DescText = styled.div`
  padding: 10px;
  display: flex;
  color: ${({ theme }) => theme.text};
`;

const Info = styled.span`
  color: ${({ theme }) => theme.textSoft};
`;

const Buttons = styled.div`
  display: flex;
  gap: 20px;
  color: ${({ theme }) => theme.text};
`;

const Button = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
  cursor: pointer;
`;

const Hr = styled.hr`
  margin: 15px 0px;
  border: 0.5px solid ${({ theme }) => theme.soft};
`;

const Channel = styled.div`
  display: flex;
  justify-content: space-between;
`;

const ChannelInfo = styled.div`
  display: flex;
  gap: 20px;
`;

const Image = styled.img`
  cursor: pointer;
  width: 50px;
  height: 50px;
  border-radius: 50%;
`;

const ChannelDetail = styled.div`
  display: flex;
  flex-direction: column;
  color: ${({ theme }) => theme.text};
`;

const ChannelName = styled.span`
  cursor: pointer;
  font-weight: 500;
`;

const ChannelCounter = styled.span`
  margin-top: 5px;
  margin-bottom: 20px;
  color: ${({ theme }) => theme.textSoft};
  font-size: 12px;
`;

const Subscribe = styled.button`
  background-color: #cc1a00;
  font-weight: 500;
  color: white;
  border: none;
  border-radius: 3px;
  height: max-content;
  padding: 10px 20px;
  cursor: pointer;
`;

const VideoFrame = styled.video`
  max-height: 720px;
  width: 100%;
  object-fit: cover;
`;

const EditButton = styled.button`
  padding: 5px 10px;
  font-size: 20px;
  background-color: transparent;
  border: 1px solid #cc1a00;
  color: #cc1a00;
  border-radius: 5px;
  font-weight: 600;
  margin-top: 10px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 5px;
`;

const Video = () => {
  const { currentUser } = useSelector((state) => state.user);
  const { currentVideo } = useSelector((state) => state.video);
  const [channel, setChannel] = useState({});
  const [open, setOpen] = useState(false);
  const [playlistOpen, setPlaylistOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const dispatch = useDispatch();
  const path = useLocation().pathname.split("/")[2];
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const videoRes = await axios.get(`/videos/find/${path}`);
        const channelRes = await axios.get(`/users/find/${videoRes.data.userId}`);
        setChannel(channelRes.data);
        dispatch(fetchSuccess(videoRes.data));
      } catch (err) {
        console.log("User AUTH Error");
      }
    };
    fetchData();
  }, [path, dispatch]);

  const handleLike = async () => {
    await axios.put(`/users/like/${currentVideo._id}`);
    dispatch(like(currentUser._id));
  };
  const handleDislike = async () => {
    await axios.put(`/users/dislike/${currentVideo._id}`);
    dispatch(dislike(currentUser._id));
  };

  const handleSub = async () => {
    currentUser.subscribedUsers.includes(channel._id)
      ? await axios.put(`/users/unsub/${channel._id}`)
      : await axios.put(`/users/sub/${channel._id}`);
    dispatch(subscription(channel._id));
  };

  const [isSaved, setIsSaved] = useState(false);
  useEffect(() => {
    if (currentUser) {
      setIsSaved(currentUser.library?.includes(currentVideo?._id) || false);
    } else {
      setIsSaved(false);
    }
  }, [currentUser, currentVideo]);

  const handleSave = async () => {
    try {
      if (!currentUser) {
        console.log("currentUser is null");
      }
      if (isSaved) {
        const response = await axios.delete(
          `/users/library/${currentUser._id}/${currentVideo._id}/`
        );
        dispatch(librarySuccess(response.data.library));
        setIsSaved(false);
        console.log("This video has been removed from library");
      } else {
        const response = await axios.put(
          `/users/library/${currentUser._id}/${currentVideo._id}/`
        );
        dispatch(librarySuccess(response.data.library));
        setIsSaved(true);
        console.log("This video has been added to library");
      }
    } catch (error) {
      dispatch(libraryFailure(error.message));
    }
  };

  const formatView = (n) => {
    if (n < 1e3) return n;
    if (n >= 1e3 && n < 1e6) return +(n / 1e3).toFixed(1) + "K";
    if (n >= 1e6 && n < 1e9) return +(n / 1e6).toFixed(1) + "M";
    if (n >= 1e9 && n < 1e12) return +(n / 1e9).toFixed(1) + "B";
    if (n >= 1e12) return +(n / 1e12).toFixed(1) + "T";
  };

  return (
    <Container>
      <Content>
        {currentVideo ? (
          <>
            <VideoWrapper>
              <VideoFrame src={currentVideo.videoUrl} controls />
            </VideoWrapper>
            <Title>{currentVideo.title}</Title>

            <Details>
              <Info>
                {formatView(currentVideo.views)} • {format(currentVideo.createdAt)}
              </Info>
              <Buttons>
                {currentUser && currentVideo.userId === currentUser._id ? (
                  <>
                    <EditButton onClick={() => setOpen(true)}>
                      Edit Video
                    </EditButton>
                  </>
                ) : null}
                <Button onClick={handleLike}>
                  {currentVideo.likes?.includes(currentUser?._id) ? (
                    <ThumbUpIcon />
                  ) : (
                    <ThumbUpOutlinedIcon />
                  )}{" "}
                  {currentVideo.likes?.length}
                </Button>
                <Button onClick={handleDislike}>
                  {currentVideo.dislikes?.includes(currentUser?._id) ? (
                    <ThumbDownIcon />
                  ) : (
                    <ThumbDownOffAltOutlinedIcon />
                  )}{" "}
                  Dislike
                </Button>
                {!currentUser && (
                  <div>
                    <Button
                      style={{ color: "red" }}
                      onClick={() => navigate("/signin")}
                    >
                      <AccountCircleOutlined />
                      You must login to interact
                    </Button>
                  </div>
                )}
                <Button onClick={handleSave}>
                  {isSaved ? (
                    <>
                      <AddTaskOutlinedIcon style={{ color: "red" }} />
                      Remove
                    </>
                  ) : (
                    <>
                      <AddTaskOutlinedIcon />
                      Save
                    </>
                  )}
                </Button>
                <Button onClick={() => setPlaylistOpen(true)}>
                  <PlaylistAddIcon /> Add to Playlist
                </Button>
                <Button>
                  <FlagCircleIcon onClick={() => setReportOpen(true)} /> Report
                </Button>
              </Buttons>
            </Details>
            <Desc>
              <DescText>{currentVideo.desc}</DescText>
            </Desc>
            <Hr />
            <Channel>
              <ChannelInfo>
                <Image
                  onClick={() =>
                    navigate(`/users/find/${channel._id}`, {
                      state: { userId: channel._id },
                    })
                  }
                  src={channel.img}
                />
                <ChannelDetail>
                  <ChannelName
                    onClick={() =>
                      navigate(`/users/find/${channel._id}`, {
                        state: { userId: channel._id },
                      })
                    }
                  >
                    {channel.name}
                  </ChannelName>
                  <ChannelCounter>{channel.subscribers} subscribers</ChannelCounter>
                </ChannelDetail>
              </ChannelInfo>
              <Subscribe onClick={handleSub} disabled={!currentUser}>
                {currentUser?.subscribedUsers?.includes(channel._id)
                  ? "SUBSCRIBED"
                  : "SUBSCRIBE"}
              </Subscribe>
            </Channel>
            <Hr />
            <Comments videoId={currentVideo._id} />
          </>
        ) : (
          <p>Loading...</p>
        )}
      </Content>
      {currentVideo && <Recommendation tags={currentVideo.tags} />}
      {open && <UpdateVideo setOpen={setOpen} />}
      {reportOpen && <ReportVideo setReportOpen={setReportOpen} />}
      {playlistOpen && <PlaylistAdd setPlaylistOpen={setPlaylistOpen} />}
    </Container>
  );
};

export default Video;
