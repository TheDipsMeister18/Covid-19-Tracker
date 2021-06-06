import React, { useState, useEffect } from 'react';
import './App.css';
import {
	MenuItem,
	FormControl,
	Select,
	Card,
	CardContent,
} from '@material-ui/core';
import Map from './Map';
import InfoBox from './InfoBox';
import Table from './Table';
import LineGraph from './LineGraph';
import { sortData, prettyPrintStat } from './util';
import 'leaflet/dist/leaflet.css';

function App() {
	const [country, setInputCountry] = useState('worldwide');
	const [countries, setCountries] = useState([]);
	const [countryInfo, setCountryInfo] = useState({});
	const [tableData, setTableData] = useState([]);
	const [mapCenter, setMapCenter] = useState({ lat: 51.505, lng: -0.09 });
	const [zoom, setZoom] = useState(2);
	const [mapCountries, setMapCountries] = useState([]);
	const [casesType, setCasesType] = useState('cases');

	useEffect(() => {
		fetch('https://disease.sh/v3/covid-19/all')
			.then((response) => response.json())
			.then((data) => {
				setCountryInfo(data);
			});
	}, []);
	useEffect(() => {
		const getCountriesData = async () => {
			fetch('https://disease.sh/v3/covid-19/countries')
				.then((response) => response.json())
				.then((data) => {
					const countries = data.map((country) => ({
						name: country.country,
						value: country.countryInfo.iso2,
					}));
					let sortedData = sortData(data);
					setCountries(countries);
					setMapCountries(data);
					setTableData(sortedData);
				});
		};
		getCountriesData();
	}, []);

	const onCountryChange = async (e) => {
		const countryCode = e.target.value;

		const url =
			countryCode === 'worldwide'
				? 'https://disease.sh/v3/covid-19/all'
				: `https://disease.sh/v3/covid-19/countries/${countryCode}`;
		await fetch(url)
			.then((response) => response.json())
			.then((data) => {
				setInputCountry(countryCode);
				setCountryInfo(data);
				countryCode === 'worldwide'
					? setMapCenter([34.80746, -40.4796])
					: setMapCenter([data.countryInfo.lat, data.countryInfo.long]);
				setZoom(4);
			});
	};

	return (
		<div className='app'>
			<div className='app__left'>
				<div className='app__header'>
					<h1>Covid 19 Tracker</h1>
					<FormControl className='app__dropdown'>
						<Select
							variant='outlined'
							value={country}
							onChange={onCountryChange}>
							<MenuItem value='worldwide'>Worldwide</MenuItem>
							{countries.map((country) => (
								<MenuItem value={country.value}>{country.name}</MenuItem>
							))}
						</Select>
					</FormControl>
				</div>
				<div className='app__stats'>
					<InfoBox
						title='Coronavirus Cases'
						isRed
						active={casesType === 'cases'}
						onClick={(e) => setCasesType('cases')}
						cases={prettyPrintStat(countryInfo.todayCases)}
						total={prettyPrintStat(countryInfo.cases)}
					/>
					<InfoBox
						title='Recovered'
						active={casesType === 'recovered'}
						onClick={(e) => setCasesType('recovered')}
						cases={prettyPrintStat(countryInfo.todayRecovered)}
						total={prettyPrintStat(countryInfo.recovered)}
					/>
					<InfoBox
						title='Deaths'
						isGrey
						active={casesType === 'deaths'}
						onClick={(e) => setCasesType('deaths')}
						cases={prettyPrintStat(countryInfo.todayDeaths)}
						total={prettyPrintStat(countryInfo.deaths)}
					/>
				</div>
				<Map
					casesType={casesType}
					countries={mapCountries}
					center={mapCenter}
					zoom={zoom}
				/>
			</div>
			<Card className='app__right'>
				<CardContent>
					<div className='app__information'>
						<h3>Live Cases by Country</h3>
						<Table countries={tableData} />
						<h3 className='app__graphTitle'>Worldwide new {casesType}</h3>
						<LineGraph className='app__graph' casesType={casesType} />
					</div>
				</CardContent>
			</Card>
		</div>
	);
}

export default App;
