import AddCommentIcon from '@mui/icons-material/AddComment';
import LiveHelpIcon from '@mui/icons-material/LiveHelp';
import VideoLibraryIcon from '@mui/icons-material/VideoLibrary';
import { Box, Button, Card, CardActions, CardContent, Grid, Typography } from '@mui/material';

const SupportCenterPage = () => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: 'calc(100vh - 120px)',
        overflow: 'auto',
      }}
    >
      <Box display="flex" sx={{ pb: 2 }}>
        <Typography variant="h4">Support Center</Typography>
      </Box>
      {/* --- Support Cards --- */}
      <Grid container spacing={0}>
        <Card sx={{ height: '100%', width: '30%', display: 'flex', flexDirection: 'column' }}>
          <CardContent
            sx={{
              flexGrow: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
            }}
          >
            <LiveHelpIcon
              sx={{
                fontSize: '3rem',
                mb: 2,
              }}
              color="primary"
            />
            <Typography variant="h5" component="h2" gutterBottom>
              Get Help
            </Typography>
            <Typography color="text.secondary">
              Get support for technical issues, account problems, or general inquiries.
            </Typography>
          </CardContent>
          <CardActions sx={{ justifyContent: 'center' }}>
            <Button
              variant="contained"
              size="small"
              href="https://armyeitaas.sharepoint-mil.us/:l:/t/AI2CGriffinCustomerSupport/FFc_zdnEvBBHhmzRlBdZ6GkBT4-CbKrinPx71DV3yYbVTw?nav=MzQ1MGUzMjUtZmVhMi00NDRiLWFiNDUtNTRmNGY2YTY4MTU2"
              target="_blank"
              rel="noopener noreferrer"
            >
              SUBMIT TICKET
            </Button>
          </CardActions>
        </Card>
        <Card sx={{ height: '100%', width: '30%', display: 'flex', flexDirection: 'column' }}>
          <CardContent
            sx={{
              flexGrow: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
            }}
          >
            <AddCommentIcon
              sx={{
                fontSize: '3rem',
                mb: 2,
              }}
              color="primary"
            />
            <Typography variant="h5" component="h2" gutterBottom>
              Feature Requests
            </Typography>
            <Typography color="text.secondary">
              Share your thoughts on potential additions to the platform to help us improve it.
            </Typography>
          </CardContent>
          <CardActions sx={{ justifyContent: 'center' }}>
            <Button
              variant="contained"
              size="small"
              href="https://dod.teams.microsoft.us/l/channel/19%3Adod%3A2bca71942a0b477eb4a6f870850c077b%40thread.tacv2/Feature%20Requests?groupId=2a0cab3c-d060-4efc-9b3c-381008653156&tenantId=fae6d70f-954b-4811-92b6-0530d6f84c43"
              target="_blank"
              rel="noopener noreferrer"
            >
              SUBMIT FEEDBACK
            </Button>
          </CardActions>
        </Card>
        <Card sx={{ height: '100%', width: '30%', display: 'flex', flexDirection: 'column' }}>
          <CardContent
            sx={{
              flexGrow: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
            }}
          >
            <VideoLibraryIcon
              sx={{
                fontSize: '3rem',
                mb: 2,
              }}
              color="primary"
            />
            <Typography variant="h5" component="h2" gutterBottom>
              User Guide
            </Typography>
            <Typography color="text.secondary">Get walkthroughs on how to complete common tasks.</Typography>
          </CardContent>
          <CardActions sx={{ justifyContent: 'center' }}>
            <Button
              variant="contained"
              size="small"
              href="https://dod.teams.microsoft.us/l/entity/2a527703-1f6f-4559-a332-d8a7d288cd88/_djb2_msteams_prefix_3332638135?context=%7B%22channelId%22%3A%2219%3Adod%3Af6a581219a0d46ff89ce48ea3c5f33dc%40thread.tacv2%22%7D&tenantId=fae6d70f-954b-4811-92b6-0530d6f84c43"
              target="_blank"
              rel="noopener noreferrer"
            >
              VIEW USER GUIDE
            </Button>
          </CardActions>
        </Card>
      </Grid>
    </Box>
  );
};

export default SupportCenterPage;
