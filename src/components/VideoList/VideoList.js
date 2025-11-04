import React from 'react';
import styles from './VideoList.module.css';

const VideoList = ({ videos }) => {
  return (
    <div className={styles.videoList}>
      {videos.map((video) => (
        <div key={video.id} className={styles.videoItem}>
          <h2>{video.name}</h2>
          <p>{video.description}</p>
          <p><strong>Category:</strong> <span className={styles.categoryBadge}>{video.category}</span></p>
          <iframe
            width="400"
            height="225"
            src={`https://www.youtube.com/embed/${video.link.split('v=')[1]}`}
            title={video.name}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        </div>
      ))}
    </div>
  );
};

export default VideoList;
