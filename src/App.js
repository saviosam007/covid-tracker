import React, { useState, useEffect } from 'react';
import InfoBox from './InfoBox';
import Map from './Map';
import Table from './Table';
import LineGraph from './LineGraph';
import "leaflet/dist/leaflet.css"
import { prettyPrintStat } from './util';
import './App.css';
import { FormControl, MenuItem, Select, Card, CardContent } from "@material-ui/core";
import { sortData } from './util';
function App() {
  const [countries, setCountries] = useState([]);
  const [country, setCountry] = useState("worldwide");
  const [countryInfo, setCountryInfo] = useState({});
  const [tableData, setTableData] = useState([])
  const [casesType, setCasesType] = useState("cases")
  const [mapCenter, setMapCenter] = useState({ lat: 34.80746, lng: -40.4796 });
  const [mapZoom, setMapZoom] = useState(3)
  const [mapCountries, setMapCountries] = useState([])


  useEffect(() => {
    fetch("https://disease.sh/v3/covid-19/all")
      .then(response => response.json())
      .then(data => setCountryInfo(data));
  }, [])
  // called once initially and also u can set it fire for a particular variable change
  useEffect(() => {
    const getCountries = async () => {
      await fetch("https://disease.sh/v3/covid-19/countries")
        .then((response) => response.json())
        .then((data) => {
          const countries = data.map(country => (
            {
              name: country.country,
              value: country.countryInfo.iso2
            }
          ));
          const sortedData = sortData(data)
          setMapCountries(data);
          setTableData(sortedData);
          setCountries(countries);
        })
    };
    getCountries();
  }, [])

  const onCountryChange = async (event) => {
    const countryCode = event.target.value;

    const url = countryCode === 'worldwide' ?
      `https://disease.sh/v3/covid-19/all` : `https://disease.sh/v3/covid-19/countries/${countryCode}`
    //
    await fetch(url)
      .then(response => response.json())
      .then(data => {
        setCountry(countryCode);
        setCountryInfo(data);
        setMapCenter([data.countryInfo.lat, data.countryInfo.long]);
        setMapZoom(4);
      })
  };
  console.log(countryInfo);
  return (
    <div className="app">
      <div className="app__left">
        <div className="app__header">
          <h1> COVID-19 Tracker</h1>

          <FormControl className="app_dropdown">
            <Select variant="outlined" onChange={onCountryChange} value={country}>
              <MenuItem value="worldwide">Worldwide </MenuItem>
              {countries.map(country => (
                <MenuItem value={country.value}>{country.name} </MenuItem>
              ))}
            </Select>

          </FormControl>
        </div>
        <div className="app__stats">
          {/* infobox */}
          <InfoBox title="cases"
            onClick={(e) => setCasesType("cases")}
            isRed
            active={casesType === "cases"}
            cases={prettyPrintStat(countryInfo.todayCases)} total={prettyPrintStat(countryInfo.cases)} ></InfoBox>
          <InfoBox title="recovered"
            onClick={(e) => setCasesType("recovered")}
            active={casesType === "recovered"}
            cases={prettyPrintStat(countryInfo.todayRecovered)} total={prettyPrintStat(countryInfo.recovered)}></InfoBox>
          <InfoBox title="deaths"
            isRed
            active={casesType === "deaths"}
            onClick={(e) => setCasesType("deaths")}
            cases={prettyPrintStat(countryInfo.todayDeaths)} total={prettyPrintStat(countryInfo.deaths)}></InfoBox>

        </div>
        <Map casesType={casesType} center={mapCenter} zoom={mapZoom} countries={mapCountries}></Map>

      </div>
      <Card className="app__right">
        <CardContent>
          <h3> Live cases by country</h3>
          <Table countries={tableData}></Table>
          <h3 className="app__graphTitle"> worldwide new cases</h3>
          <LineGraph className="app_graph" casesType={casesType}></LineGraph>
        </CardContent>

        {/* graph */}
      </Card>
    </div>

  );
}

export default App;
