interface ProfileData {
    profileName: string;
    bio: string;
    profilePicUrl: string;
  }
  
  export const generateProfileCardHtml = ({ profileName, bio, profilePicUrl }: ProfileData) => `
  <!DOCTYPE html>
  <html>
  <head>
      <title>${profileName}'s Profile</title>
      <style>
          body {
              background-color: #f4f4f4;
              font-family: Arial, sans-serif;
              margin: 0;
              padding: 0;
          }
          .container {
              display: flex;
              justify-content: center;
              align-items: center;
              height: 100vh;
          }
          .profile-card {
              background: linear-gradient(to bottom right, #fff, #f2f2f2);
              border-radius: 10px;
              box-shadow: 0 4px 8px rgba(0,0,0,0.1);
              overflow: hidden;
              width: 80%;
              max-width: 800px;
              display: flex;
              flex-direction: row;
          }
          .profile-photo {
              flex: 1;
              max-width: 600px;
          }
          .profile-photo img {
              border-radius: 5px 0 0 5px;
              width: 100%;
              max-width: 600px;
              height: auto;
          }
          .profile-info {
              flex: 2;
              padding: 20px;
          }
          .name {
              font-size: 36px;
              color: #333;
          }
          .bio {
              margin-top: 20px;
              font-size: 16px;
              color: #555;
          }
      </style>
  </head>
  <body>
      <div class="container">
          <div class="profile-card">
              <div class="profile-photo">
                  <img src="${profilePicUrl}" alt="Profile Picture" />
              </div>
              <div class="profile-info">
                  <div class="name">${profileName}</div>
                  <div class="bio">${bio}</div>
              </div>
          </div>
      </div>
  </body>
  </html>
`;
