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
  Typography,
  Avatar,
  Popover,
} from '@material-ui/core'
import { makeStyles, Theme, createStyles } from '@material-ui/core/styles'
import { useTheme } from '@material-ui/core/styles'
import useMediaQuery from '@material-ui/core/useMediaQuery'
import { useLocation, useHistory } from 'react-router-dom'
import AddIcon from '@material-ui/icons/Add'
import AddCircleIcon from '@material-ui/icons/AddCircle'
import DashboardIcon from '@material-ui/icons/Dashboard'
import QuestionAnswerIcon from '@material-ui/icons/QuestionAnswer'
import SettingsInputComponentIcon from '@material-ui/icons/SettingsInputComponent'
import MenuIcon from '@material-ui/icons/Menu'
import ExitToAppIcon from '@material-ui/icons/ExitToApp'
import NewQuestioForm from './NewQuestionForm'
import NewDashboardForm from './NewDashboardForm'
import GoogleIcon from '../GoogleIcon'
import { useUser } from '../../hooks'

const Title = () => {
  const location = useLocation<{ title?: string }>()
  let path = location.pathname
    .split('/')
    .filter((p: string, idx: number, self: string[]) => self.indexOf(p) === idx)
  let accPath = '/'

  const theme = useTheme()
  const isXS = useMediaQuery(theme.breakpoints.down('xs'))

  if (isXS) {
    path = [path[path.length - 1]]
  }
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

const DrawerMenu = ({ open, navigate, onClose }: DrawerMenuProps) => {
  const location = useLocation()
  const history = useHistory()

  return (
    <Drawer anchor="left" open={open} onClose={onClose}>
      <Box width={300}>
        <List dense>
          <ListItem onClick={() => {
            history.push('/')
            onClose()
          }}>
            <Typography variant="h3">BIData</Typography>
          </ListItem>
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
          <Divider />
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
      </Box>
    </Drawer>
  )
}

const useAvatarStyles = makeStyles((theme: Theme) =>
  createStyles({
    small: {
      width: theme.spacing(4),
      height: theme.spacing(4),
    },
  })
)

const useMenuStyles = makeStyles((theme: Theme) =>
  createStyles({
    popover: {
      marginTop: theme.spacing(2),
    },
  })
)

type HeaderContentProps = {
  openMenu: () => void
  openAddNewSelector: (e: any) => void
  openUserMenu: (e: any) => void
}
const HeaderContent = ({
  openMenu,
  openAddNewSelector,
  openUserMenu,
}: HeaderContentProps) => {
  const theme = useTheme()
  const isXS = useMediaQuery(theme.breakpoints.down('xs'))
  const { user } = useUser()
  const { small } = useAvatarStyles()

  return (
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
          {isXS ? (
            <IconButton color="inherit" onClick={openAddNewSelector}>
              <AddCircleIcon />
            </IconButton>
          ) : (
              <Button
                variant="outlined"
                color="inherit"
                size="small"
                startIcon={<AddIcon />}
                onClick={openAddNewSelector}
              >
                Add new ...
              </Button>
            )}
          <Box m={1} />
          <IconButton onClick={openUserMenu}>
            <Avatar
              alt={`${user?.firstName} ${user?.lastName}`}
              src={user?.picture}
              className={small}
            />
          </IconButton>
        </Box>
      </Grid>
    </Toolbar>
  )
}

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
}: AddNewSelectorProps) => {
  const classes = useMenuStyles()
  return (
    <Popover
      open={open}
      keepMounted
      anchorEl={anchorEl}
      onClose={onClose}
      className={classes.popover}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'right',
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
    >
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
    </Popover>
  )
}

type UserMenuProps = {
  open: boolean
  anchorEl: Element | null
  logout: () => void
  onClose: () => void
}
const UserMenu = ({ open, anchorEl, logout, onClose }: UserMenuProps) => {
  return (
    <Popover
      open={open}
      keepMounted
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'right',
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
    >
      <MenuItem onClick={logout}>
        <ListItemIcon>
          <ExitToAppIcon />
        </ListItemIcon>
        <ListItemText primary="Log out" />
      </MenuItem>
    </Popover>
  )
}
const HeaderForAuthenticatedUser = React.memo(() => {
  const history = useHistory()

  const [addAnchorEl, setAddAnchorEl] = React.useState<HTMLElement | null>(null)
  const [
    userMenuAnchorEl,
    setUserMenuAnchorEl,
  ] = React.useState<HTMLElement | null>(null)
  const [isMenuOpen, setIsMenuOpen] = React.useState(false)

  const [isNewQuestionFormOpen, setNewQuestionFormOpen] = React.useState(false)
  const [isNewDashboardFormOpen, setNewDashboardFormOpen] = React.useState(
    false
  )

  const { logout } = useUser()

  return (
    <AppBar position="static">
      <HeaderContent
        openMenu={() => setIsMenuOpen(true)}
        openAddNewSelector={(e) => setAddAnchorEl(e.currentTarget)}
        openUserMenu={(e) => setUserMenuAnchorEl(e.currentTarget)}
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
      <UserMenu
        open={!!userMenuAnchorEl}
        anchorEl={userMenuAnchorEl}
        logout={logout}
        onClose={() => setUserMenuAnchorEl(null)}
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

const AnonymousHeader = React.memo(() => {
  const [signinAnchor, setSigninAnchor] = React.useState<any>()
  const { login } = useUser()

  return (
    <AppBar position="static">
      <Toolbar>
        <Grid
          container
          direction="row"
          justify="space-between"
          align-items="center"
        >
          <Typography variant="h6">BIData</Typography>
          <Box display="flex" flexDirection="row" alignItems="center">
            <Button
              variant="outlined"
              color="inherit"
              size="small"
              disabled={!login}
              onClick={(e) => setSigninAnchor(e.currentTarget)}
            >
              Sign In
            </Button>
          </Box>
        </Grid>
      </Toolbar>
      <Menu
        open={!!signinAnchor}
        keepMounted
        anchorEl={signinAnchor}
        onClose={() => setSigninAnchor(null)}
      >
        <MenuItem onClick={() => login && login('google')} dense>
          <ListItemIcon>
            <GoogleIcon />
          </ListItemIcon>
          <ListItemText primary="Signin with Google" />
        </MenuItem>
      </Menu>
    </AppBar>
  )
})

export default React.memo(() => {
  const { user } = useUser()

  if (user) {
    return <HeaderForAuthenticatedUser />
  }

  return <AnonymousHeader />
})
