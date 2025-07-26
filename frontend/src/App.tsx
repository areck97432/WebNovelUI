import { AppShell, Burger, Button, Group, NavLink, useMantineColorScheme } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { BrowserRouter as Router, Link, Route, Routes } from 'react-router-dom';
import HomePage from './pages/HomePage';
import NovelDetailPage from './pages/NovelDetailPage';
import ReadingView from './pages/ReadingView';
import AdminPage from './pages/AdminPage';
import { FontSizeProvider } from './contexts/FontSizeContext';

function App() {
  const [opened, { toggle }] = useDisclosure();
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();

  return (
    <Router>
      <FontSizeProvider>
        <AppShell
          header={{ height: 60 }}
          navbar={{ width: 300, breakpoint: 'sm', collapsed: { mobile: !opened } }}
          padding="md"
        >
          <AppShell.Header>
            <Group h="100%" px="md" justify="space-between">
              <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
              <Button onClick={toggleColorScheme}>
                {colorScheme === 'dark' ? 'Light' : 'Dark'} Mode
              </Button>
            </Group>
          </AppShell.Header>

          <AppShell.Navbar p="md">
            <NavLink component={Link} to="/" label="Home" />
            <NavLink component={Link} to="/admin" label="Admin" />
          </AppShell.Navbar>

          <AppShell.Main>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/novels/:slug" element={<NovelDetailPage />} />
              <Route path="/novels/:slug/chapter/:chapterNumber" element={<ReadingView />} />
              <Route path="/admin" element={<AdminPage />} />
            </Routes>
          </AppShell.Main>
        </AppShell>
      </FontSizeProvider>
    </Router>
  );
}

export default App;
