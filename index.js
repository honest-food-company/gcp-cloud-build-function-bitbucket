const axios = require('axios');

/**
 * Triggered from a message on a Cloud Pub/Sub topic.
 *
 * @param {!Object} event Event payload.
 * @param {!Object} context Metadata for the event.
 */
exports.processPubSubMessage = (event, context) => {
  const pubsubMessage = event.data;
  const dataString = Buffer.from(pubsubMessage, 'base64').toString();
  const message = JSON.parse(dataString);
  const commitSha = message.sourceProvenance.resolvedRepoSource.commitSha;
  const repoName = message.sourceProvenance.resolvedRepoSource.repoName;
  const [bitbucket, username, repo_slug] = repoName.split('_');
  // Build Bitbucket payload data.
  const payload = {
      type: 'string',
      created_on: message.createTime,
      description: `Status: ${message.status}`,
      key: 'string',
      name: 'Google Cloud Build',
      refname: `buildTriggerId: ${message.buildTriggerId}`,
      state: getBitbucketState(message.status),
      updated_on: message.finishTime,
      url: message.logUrl,
      uuid: message.id,
  }
  // Send request to Bitbucket.
  const user = process.env.BITBUCKET_USER;
  const pass = process.env.BITBUCKET_APP_PASS;
  const url = getBuildUrl(username, repo_slug, commitSha);
  axios.post(url, payload, {
      auth: {
            username: user,
            password: pass
        }
  })
      .then(function(response){
          console.log(response);
      })
      .catch(function(error){
          console.log(error);
      });


  /**
   * See: https://developer.atlassian.com/bitbucket/api/2/reference/resource/repositories/%7Busername%7D/%7Brepo_slug%7D/commit/%7Bnode%7D/statuses/build
   * 
   * @param {string} username
   * @param {string} repo_slug
   * @param {string} commitSha 
   */
  function getBuildUrl(username, repo_slug, commitSha) {
      const baseUrl = 'https://api.bitbucket.org/2.0/repositories';
      return `${baseUrl}/${username}/${repo_slug}/commit/${commitSha}/statuses/build`;;
  }

  /**
   * Translates states from Google Cloud Build Message to Bitbucket.
   * See: https://developer.atlassian.com/bitbucket/api/2/reference/resource/repositories/%7Busername%7D/%7Brepo_slug%7D/commit/%7Bnode%7D/statuses/build
   * 
   * @param {string} status 
   */
  function getBitbucketState(status) {
      switch(status.toLowerCase()) {
          case 'success':
              return 'SUCCESSFUL';
          case 'queued':
          case 'working':
              return 'INPROGRESS';
          default:
              return 'FAILED';
      }
  }
};
