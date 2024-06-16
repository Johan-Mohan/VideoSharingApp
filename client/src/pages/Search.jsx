import axios from "axios";
import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import styled from "styled-components";
import Card from "../components/Card";

const Container = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
`;

const Search = () => {
  const [videos, setVideos] = useState([]);
  const [error, setError] = useState(null);
  const query = new URLSearchParams(useLocation().search).get("q");
  const searchType = new URLSearchParams(useLocation().search).get("type");

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        console.log("Fetching videos with query:", query, "and type:", searchType);
        let res;
        if (searchType === "title") {
          res = await axios.get(`/videos/search?q=${query}`);
        } else if (searchType === "tags") {
          res = await axios.get(`/videos/specificTags?q=${query}`);
        }
        console.log("Response data:", res.data);
        setVideos(res.data);
      } catch (err) {
        console.error("Error fetching videos:", err);
        setError(err);
      }
    };

    if (query) {
      fetchVideos();
    }
  }, [query, searchType]);

  return (
    <Container>
      {error ? (
        <p>There was an error loading the videos. Please try again later.</p>
      ) : (
        videos.map((video) => (
          <Card key={video._id} video={video} />
        ))
      )}
    </Container>
  );
};

export default Search;
