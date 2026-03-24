import AutoGraphIcon from '@mui/icons-material/AutoGraph';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import ChangeCircleIcon from '@mui/icons-material/ChangeCircle';
import FileCopyIcon from '@mui/icons-material/FileCopy';
import ModelTrainingIcon from '@mui/icons-material/ModelTraining';
import QuizIcon from '@mui/icons-material/Quiz';
import { Box, Button, Card, CardActions, CardContent, Grid, Typography } from '@mui/material';

const ToolsPage = () => {
  return (
    <Box>
      <Box mb={4}>
        <Typography variant="h4">Tools / External Links</Typography>
      </Box>
      {/* --- Tools / External Links --- */}
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
              <FileCopyIcon
                sx={{
                  fontSize: '3rem',
                  mb: 2,
                }}
                color="primary"
              />
              <Typography variant="h5" component="h2" gutterBottom>
                Central Army Registry
              </Typography>
              <Typography color="text.secondary">Find ICTLs for 15 Series Maintainers - Sunsetting Soon</Typography>
            </CardContent>
            <CardActions sx={{ justifyContent: 'center' }}>
              <Button
                variant="contained"
                size="small"
                href="https://rdl.train.army.mil/catalog/#/search?producttype=ICTL&status=R&knowledgecenter=011"
                target="_blank"
                rel="noopener noreferrer"
              >
                LAUNCH CAR
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
              <QuizIcon
                sx={{
                  fontSize: '3rem',
                  mb: 2,
                }}
                color="primary"
              />
              <Typography variant="h5" component="h2" gutterBottom>
                CT ARNG AMTP Evaluations
              </Typography>
              <Typography color="text.secondary">
                Access pre-made written annual evaluations created by the Connecticut Army National Guard.
              </Typography>
            </CardContent>
            <CardActions sx={{ justifyContent: 'center' }}>
              <Button
                variant="contained"
                size="small"
                href="https://avnctr.llc.army.mil/webapps/blackboard/execute/viewCatalog?id=&type=Course&command=NewSearch&moduleId=&searchField=CourseName&searchOperator=Contains&searchText=AMTP&dateSearchOperator=LessThan&dateSearchDate_datetime=2024-11-5+11%3A58%3A00&pickdate=&pickname=&dateSearchDate_date=11%2F05%2F2024"
                target="_blank"
                rel="noopener noreferrer"
              >
                LAUNCH BLACKBOARD
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
              <ChangeCircleIcon
                sx={{
                  fontSize: '3rem',
                  mb: 2,
                }}
                color="primary"
              />
              <Typography variant="h5" component="h2" gutterBottom>
                Digital 2028 Change Request
              </Typography>
              <Typography color="text.secondary">Aviation Digital DA Form 2028 Product Change Requests.</Typography>
            </CardContent>
            <CardActions sx={{ justifyContent: 'center' }}>
              <Button
                variant="contained"
                size="small"
                href="https://play.apps.appsplatform.us/play/e/default-fae6d70f-954b-4811-92b6-0530d6f84c43/a/465f69a9-f73e-4930-8717-30dafcb2de97?tenantId=fae6d70f-954b-4811-92b6-0530d6f84c43&sourcetime=1736300199395"
                target="_blank"
                rel="noopener noreferrer"
              >
                LAUNCH DIGITAL FORM
              </Button>
            </CardActions>
          </Card>
        </Grid>
      </Grid>
      {/* --- Tools / External Links - Row 2 --- */}
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
              <AutoGraphIcon
                sx={{
                  fontSize: '3rem',
                  mb: 2,
                }}
                color="primary"
              />
              <Typography variant="h5" component="h2" gutterBottom>
                Griffin Analytics
              </Typography>
              <Typography color="text.secondary">
                {"Griffin Analytics is the AI2C's digital fleet management tool, and companion application for A-MAP."}
              </Typography>
            </CardContent>
            <CardActions sx={{ justifyContent: 'center' }}>
              <Button
                variant="contained"
                size="small"
                href="https://griffin-analytics.ai.army.mil"
                target="_blank"
                rel="noopener noreferrer"
              >
                LAUNCH GRIFFIN
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
              <AutoStoriesIcon
                sx={{
                  fontSize: '3rem',
                  mb: 2,
                }}
                color="primary"
              />
              <Typography variant="h5" component="h2" gutterBottom>
                TC 3-04.71
              </Typography>
              <Typography color="text.secondary">{"Commander's Aviation Maintenance Training Program"}</Typography>
            </CardContent>
            <CardActions sx={{ justifyContent: 'center' }}>
              <Button
                variant="contained"
                size="small"
                href="https://armypubs.army.mil/epubs/DR_pubs/DR_a/ARN40589-TC_3-04.71-000-WEB-1.pdf"
                target="_blank"
                rel="noopener noreferrer"
              >
                LAUNCH TC 3-04.71
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
              <ModelTrainingIcon
                sx={{
                  fontSize: '3rem',
                  mb: 2,
                }}
                color="primary"
              />
              <Typography variant="h5" component="h2" gutterBottom>
                WUC Search
              </Typography>
              <Typography color="text.secondary">
                Predictive Model for identifying correct Work Unit Code given a fault remark
              </Typography>
            </CardContent>
            <CardActions sx={{ justifyContent: 'center' }}>
              <Button
                variant="contained"
                size="small"
                href="https://avnctr.llc.army.mil/webapps/blackboard/execute/viewCatalog?id=&type=Course&command=NewSearch&moduleId=&searchField=CourseName&searchOperator=Contains&searchText=AMTP&dateSearchOperator=LessThan&dateSearchDate_datetime=2024-11-5+11%3A58%3A00&pickdate=&pickname=&dateSearchDate_date=11%2F05%2F2024"
                target="_blank"
                rel="noopener noreferrer"
              >
                LAUNCH BLACKBOARD
              </Button>
            </CardActions>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ToolsPage;
