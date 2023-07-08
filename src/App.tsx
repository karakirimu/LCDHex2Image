import { Grid, Navbar, Text, changeTheme, useTheme } from "@nextui-org/react";
import { useState } from "react";
import Panel from "./Panel";

function App() {
  const { type, isDark } = useTheme();
  const [panel, setPanel] = useState(<Grid xs={8}><Panel /></Grid>)

  const handleChange = () => {
    const nextTheme = isDark ? 'light' : 'dark';
    window.localStorage.setItem('data-theme', nextTheme); // you can use any storage
    changeTheme(nextTheme);
  }

  // const AddItem = () => {
  //   return
  // }

  return (<>
    <Navbar isBordered variant="floating">
      <Navbar.Brand>
        <Text b color="inherit" hideIn="xs">
          LCDHex2Image
        </Text>
      </Navbar.Brand>
      {/* <Navbar.Content>
        <Button auto color="primary" rounded onChange={AddItem}>Add</Button>
      </Navbar.Content> */}
      <Navbar.Content>
        <Navbar.Toggle onChange={handleChange}>
          Theme: {type}
        </Navbar.Toggle>
      </Navbar.Content>
    </Navbar>
    <Grid.Container gap={2} justify="center">
      {panel}
    </Grid.Container>
  </>);
}

export default App
