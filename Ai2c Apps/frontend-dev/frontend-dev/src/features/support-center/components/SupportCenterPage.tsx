import AddCommentIcon from '@mui/icons-material/AddComment';
import LiveHelpIcon from '@mui/icons-material/LiveHelp';
import VideoLibraryIcon from '@mui/icons-material/VideoLibrary';
import { Box, Button, Card, CardActions, CardContent, Grid, Link, Typography } from '@mui/material';

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
      <Grid container spacing={4} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
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
                href="https://armyeitaas.sharepoint-mil.us/:l:/t/AI2CA-MAPCustomerSupport/JACjhBaTzNUySJn5vDoh3GAJAZ2xAF4VoUWTCvfNjfP6RPk?nav=MmVjNzliMzYtYzdhMS00MGVhLThhNDAtNTE0Y2YxYmExZDk1"
                target="_blank"
                rel="noopener noreferrer"
              >
                SUBMIT TICKET
              </Button>
            </CardActions>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
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
                Give Feedback
              </Typography>
              <Typography color="text.secondary">
                Share your thoughts and report any issues with the new platform to help us improve it.
              </Typography>
            </CardContent>
            <CardActions sx={{ justifyContent: 'center' }}>
              <Button
                variant="contained"
                size="small"
                href="https://forms.osi.apps.mil/Pages/ResponsePage.aspx?id=D9fm-kuVEUiStgUw1vhMQ7CnW4j9q5JJqkdufUV0qYRUOVdMTFNTWU1TT1pSSVpBVkc1MlRGU0xLSS4u"
                target="_blank"
                rel="noopener noreferrer"
              >
                SUBMIT FEEDBACK
              </Button>
            </CardActions>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
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
                href="https://dod.teams.microsoft.us/l/entity/2a527703-1f6f-4559-a332-d8a7d288cd88/_djb2_msteams_prefix_1547125553?context=%7B%22channelId%22%3A%2219%3Adod%3A73803d60cfe146349a8586dc34c0ebdc%40thread.tacv2%22%7D&tenantId=fae6d70f-954b-4811-92b6-0530d6f84c43"
                target="_blank"
                rel="noopener noreferrer"
              >
                VIEW USER GUIDE
              </Button>
            </CardActions>
          </Card>
        </Grid>
      </Grid>
      {/* --- Fallback Link --- */}
      <Box sx={{ my: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Typography>Still having trouble?</Typography>
        <Link href="https://amap-classic.ai.army.mil/" underline="hover">
          Launch A-MAP Classic
        </Link>
      </Box>
      <Box
        sx={{
          height: '80vh',
          width: '100%',
          overflowY: 'auto',
          mt: 2,
        }}
      >
        <Typography sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          Emotional Support Dog
        </Typography>
        <Box
          component="iframe"
          src="https://random.dog/"
          title="Random Dog Image"
          sx={{
            width: '100%',
            height: '100%',
            border: 'none',
          }}
        />
      </Box>
    </Box>
  );
};

export default SupportCenterPage;
