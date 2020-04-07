import * as React from 'react'
import {
  Box,
  IconButton,
  Breadcrumbs,
  Link,
  AppBar,
  Toolbar,
  Button,
  Grid,
  Menu,
  MenuItem,
  ListItemText,
  ListItemIcon,
  Drawer,
  List,
  ListItem,
  Divider,
} from '@material-ui/core'
import { makeStyles, Theme, createStyles } from '@material-ui/core/styles'
import { useLocation, useHistory } from 'react-router-dom'
import { Skeleton } from '@material-ui/lab'
import AddIcon from '@material-ui/icons/Add'
import DashboardIcon from '@material-ui/icons/Dashboard'
import QuestionAnswerIcon from '@material-ui/icons/QuestionAnswer'
import SettingsInputComponentIcon from '@material-ui/icons/SettingsInputComponent'
import MenuIcon from '@material-ui/icons/Menu'
import SettingsIcon from '@material-ui/icons/Settings'
import NewQuestioForm from './NewQuestionForm'
import NewDashboardForm from './NewDashboardForm'

const Title = () => {
  const location = useLocation<{ title?: string }>()
  const path = location.pathname
    .split('/')
    .filter((p: string, idx: number, self: string[]) => self.indexOf(p) === idx)
  let accPath = '/'

  return (
    <Breadcrumbs color="primary.contrastText">
      {path.map((page: string, idx: number) => {
        accPath += page ? `${page}/` : ''

        let title = page || 'BIData'
        if (idx === path.length - 1) {
          title =
            location.state && location.state.title
              ? location.state.title
              : title
        }

        return (
          <Link key={accPath} color="inherit" href={accPath} variant="h6">
            {title}
          </Link>
        )
      })}
    </Breadcrumbs>
  )
}

type DrawerMenuProps = {
  open: boolean
  navigate: (path: string) => void
  onClose: () => void
}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    nested: {
      paddingLeft: theme.spacing(4),
    },
  })
)

const DrawerMenu = ({ open, navigate, onClose }: DrawerMenuProps) => {
  const location = useLocation()
  const classes = useStyles()

  return (
    <Drawer anchor="left" open={open} onClose={onClose}>
      <Box width={300}>
        <Box m={3}>
          <Skeleton variant="circle" width={80} height={80} />
          <Skeleton variant="text" />
        </Box>
        <List>
          <ListItem
            button
            selected={location.pathname === '/dashboards'}
            onClick={() => navigate('/dashboards')}
          >
            <ListItemIcon>
              <DashboardIcon />
            </ListItemIcon>
            <ListItemText primary="Dashboards" />
          </ListItem>
          <ListItem
            button
            selected={location.pathname === '/questions'}
            onClick={() => navigate('/questions')}
          >
            <ListItemIcon>
              <QuestionAnswerIcon />
            </ListItemIcon>
            <ListItemText primary="Questions" />
          </ListItem>
        </List>
        <Divider />
        <List>
          <ListItem
            button
            selected={location.pathname === '/admin'}
            onClick={() => navigate('/admin')}
          >
            <ListItemIcon>
              <SettingsIcon />
            </ListItemIcon>
            <ListItemText primary="Admin" />
          </ListItem>
          <List component="div" disablePadding className={classes.nested}>
            <ListItem
              button
              selected={location.pathname === '/admin/connections'}
              onClick={() => navigate('/admin/connections')}
            >
              <ListItemIcon>
                <SettingsInputComponentIcon />
              </ListItemIcon>
              <ListItemText primary="Connections" />
            </ListItem>
          </List>
        </List>
      </Box>
    </Drawer>
  )
}

type HeaderContentProps = {
  openMenu: () => void
  openAddNewSelector: (e: any) => void
}
const HeaderContent = ({
  openMenu,
  openAddNewSelector,
}: HeaderContentProps) => (
  <Toolbar style={{ paddingLeft: 0 }}>
    <Grid
      container
      direction="row"
      justify="space-between"
      align-items="center"
    >
      <Box
        color="primary.contrastText"
        display="flex"
        flexDirection="row"
        alignItems="center"
      >
        <IconButton style={{ color: 'white' }} onClick={openMenu}>
          <MenuIcon />
        </IconButton>
        <Title />
      </Box>
      <Box display="flex" flexDirection="row" alignItems="center">
        <Button
          variant="outlined"
          color="inherit"
          size="small"
          startIcon={<AddIcon />}
          onClick={openAddNewSelector}
        >
          Add new ...
        </Button>
      </Box>
    </Grid>
  </Toolbar>
)

type AddNewSelectorProps = {
  open: boolean
  anchorEl: Element | null
  openNewDashboard: () => void
  openNewQuestion: () => void
  onClose: () => void
}
const AddNewSelector = ({
  open,
  anchorEl,
  openNewDashboard,
  openNewQuestion,
  onClose,
}: AddNewSelectorProps) => (
  <Menu open={open} keepMounted anchorEl={anchorEl} onClose={onClose}>
    <MenuItem onClick={openNewDashboard}>
      <ListItemIcon>
        <DashboardIcon />
      </ListItemIcon>
      <ListItemText primary="Dashboard" />
    </MenuItem>
    <MenuItem onClick={openNewQuestion}>
      <ListItemIcon>
        <QuestionAnswerIcon />
      </ListItemIcon>
      <ListItemText primary="Question" />
    </MenuItem>
  </Menu>
)

export default React.memo(() => {
  const history = useHistory()

  const [addAnchorEl, setAddAnchorEl] = React.useState<HTMLElement | null>(null)
  const [isMenuOpen, setIsMenuOpen] = React.useState(false)

  const [isNewQuestionFormOpen, setNewQuestionFormOpen] = React.useState(false)
  const [isNewDashboardFormOpen, setNewDashboardFormOpen] = React.useState(
    false
  )

  return (
    <AppBar position="static">
      <HeaderContent
        openMenu={() => setIsMenuOpen(true)}
        openAddNewSelector={(e) => setAddAnchorEl(e.currentTarget)}
      />
      <DrawerMenu
        open={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        navigate={(path: string) => {
          history.push(path)
          setIsMenuOpen(false)
        }}
      />
      <AddNewSelector
        open={!!addAnchorEl}
        anchorEl={addAnchorEl}
        openNewDashboard={() => {
          setAddAnchorEl(null)
          setNewDashboardFormOpen(true)
        }}
        openNewQuestion={() => {
          setAddAnchorEl(null)
          setNewQuestionFormOpen(true)
        }}
        onClose={() => setAddAnchorEl(null)}
      />
      <NewQuestioForm
        open={isNewQuestionFormOpen}
        onClose={() => setNewQuestionFormOpen(false)}
        onSuccess={(question: any) => {
          history.push(`/questions/${question._id}`)
          setNewQuestionFormOpen(false)
        }}
      />
      <NewDashboardForm
        open={isNewDashboardFormOpen}
        onClose={() => setNewDashboardFormOpen(false)}
        onSuccess={(dashboard: any) => {
          history.push(`/dashboards/${dashboard._id}`)
          setNewDashboardFormOpen(false)
        }}
      />
    </AppBar>
  )
})
