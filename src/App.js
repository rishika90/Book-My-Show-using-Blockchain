import { useEffect, useState } from "react";
import { ethers } from "ethers";

// Components
import Navigation from "./components/Navigation";
import Sort from "./components/Sort";
import Card from "./components/Card";
import SeatChart from "./components/SeatChart";

// ABIs
import TokenMaster from "./abis/TokenMaster.json";

// Config
import config from "./config.json";

function App() {
  const [account, setAccount] = useState(null);
  const [provider, setProvider] = useState(null);
  const [tokenMaster, setTokenMaster] = useState(null);
  const [occasions, setOccasions] = useState([]);

  const [occasion, setOccasion] = useState({});
  const [toggle, setToggle] = useState(false);

  const loadConnectedAccount = async () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    setProvider(provider);

    const network = await provider.getNetwork();

    const address = config[network.chainId].TokenMaster.address;

    const tokenMaster = new ethers.Contract(address, TokenMaster, provider);
    setTokenMaster(tokenMaster);

    const totalOccasions = await tokenMaster.totalOccasions();

    const occasions = [];

    for (var i = 1; i <= totalOccasions; ++i) {
      const occassion = await tokenMaster.getOccasion(i);
      occasions.push(occassion);
    }

    setOccasions(occasions);
    await window.ethereum.on("accountsChanged", async () => {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      const account = ethers.utils.getAddress(accounts[0]);
      setAccount(account);
    });
  };

  useEffect(() => {
    loadConnectedAccount();
  }, []);

  return (
    <div>
      <header>
        <h2 className="header__title">
          <strong>Event</strong> Tickets
        </h2>
        <Navigation account={account} setAccount={setAccount} />
      </header>

      <Sort />

      <div className="cards">
        {occasions.map((occasion, index) => (
          <Card
            occasion={occasion}
            id={index + 1}
            tokenMaster={tokenMaster}
            provider={provider}
            account={account}
            toggle={toggle}
            setToggle={setToggle}
            setOccasion={setOccasion}
            key={index}
          />
        ))}
      </div>

      {toggle && (
        <SeatChart
          occasion={occasion}
          tokenMaster={tokenMaster}
          provider={provider}
          setToggle={setToggle}
        />
      )}
    </div>
  );
}

export default App;
