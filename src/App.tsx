import { useState, useEffect } from 'react';
import './App.css';
import CompanyGraph from './CompanyGraph';

export type Company = {
  altana_canon_id: string;
  company_context: {
    buyers: [];
    countries_of_destination: [];
    countries_of_operation: [];
    countries_of_origin: [];
    hs_traded: [];
    industries: [];
    number_records: number;
    products_received: [];
    products_sent: [];
    suppliers: [];
    trading_partners: [];
  };
  company_name: string;
  data_sources: [];
  restrictions: [];
  risks: [];
};

type Edge = {
  company_canon_ids: string[];
  edge_canon_id: string;
  edge_type: string;
  trade_relationships: [
    {
      countries_of_destination: [];
      countries_of_origin: [];
      exporter_canon_id: string;
      exporter_company_canon_id: string;
      exporter_company_name: string;
      exporter_restrictions: [];
      hs_traded: [];
      importer_canon_id: string;
      importer_company_canon_id: string;
      importer_company_name: string;
      importer_restrictions: [];
      industries: [];
      number_records: number;
      risks: [];
    }
  ];
};

function App() {
  const [searchInputValue, setSearchInputValue] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [companyData, setCompanyData] = useState(null);
  const [companySearchError, setCompanySearchError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [tradingPartnerCompanies, setTradingPartnerCompanies] = useState(
    [] as any[]
  );
  const [tradingPartnerEdges, setTradingPartnerEdges] = useState([] as any[]);
  const [tradingPartnersError, setTradingPartnersError] = useState(null);
  const [loadedTradingPartners, setLoadedTradingPartners] = useState(null);

  function onSearchInputChange(
    event: React.ChangeEvent<HTMLInputElement>
  ): void {
    setSearchInputValue(event.currentTarget.value);
  }

  function submitSearch(event: React.FormEvent<HTMLFormElement>): void {
    event.preventDefault();

    if (loading || !searchInputValue || !searchInputValue.trim()) {
      return;
    }

    setCompanyData(null);
    setCompanySearchError(null);
    setSearchTerm(searchInputValue);
    setLoading(true);

    fetch(
      `https://api.altana.ai/atlas/v1/company/search/${encodeURIComponent(
        searchInputValue
      )}`,
      {
        method: 'GET',
        headers: {
          accept: 'application/json',
          'X-Api-Key':
            'MTpJbnRlcnZpZXclMjAyMDIxLTA5LTIyOjE2MzIzNTk2NTU6NWNhMzViYjk.ZmEwZWI5OTdmYWJjYWFlZWJmY2YyNGYyN2FkMmQ5YzkwODQ4NWNiYg',
        },
      }
    )
      .then((response) => {
        if (response.ok) {
          return response.json();
        } else {
          throw response;
        }
      })
      .then((searchResults) => {
        setCompanyData(searchResults);
      })
      .catch((searchError) => {
        console.error(searchError);
        setCompanySearchError(searchError);
      })
      .finally(() => {
        setLoading(false);
      });
  }

  function onCompanyResultClick(
    event: React.MouseEvent<HTMLButtonElement>
  ): void {
    const selected = companyData.companies.filter(
      (company: Company) =>
        company.altana_canon_id === event.currentTarget.dataset.key
    )[0];
    setSelectedCompany(selected);

    fetch(
      `https://api.altana.ai/atlas/v1/company/id/${encodeURIComponent(
        selected.altana_canon_id
      )}/trading-partners`,
      {
        method: 'GET',
        headers: {
          accept: 'application/json',
          'X-Api-Key':
            'MTpJbnRlcnZpZXclMjAyMDIxLTA5LTIyOjE2MzIzNTk2NTU6NWNhMzViYjk.ZmEwZWI5OTdmYWJjYWFlZWJmY2YyNGYyN2FkMmQ5YzkwODQ4NWNiYg',
        },
      }
    )
      .then((response) => {
        if (response.ok) {
          return response.json();
        } else {
          throw response;
        }
      })
      .then((searchResults) => {
        setTradingPartnerCompanies(searchResults.companies);
        setTradingPartnerEdges(searchResults.edges);
        setLoadedTradingPartners((input) => {
          const newValue = input ? { ...input } : {};
          searchResults.companies.forEach((company) => {
            newValue[company.altana_canon_id] = {
              level: 2,
              name: company.company_name,
              loaded: false,
            };
          });
          return newValue;
        });
      })
      .catch((searchError) => {
        console.error(searchError);
        setTradingPartnersError(searchError);
      });
  }

  function renderCompanyResult(company: Company): JSX.Element {
    return (
      <button
        type="button"
        className="search-result"
        key={company.altana_canon_id}
        data-key={company.altana_canon_id}
        onClick={onCompanyResultClick}
      >
        {company.company_name}
      </button>
    );
  }

  function renderDataResults(): JSX.Element {
    let results = <></>;

    if (!loading && companyData) {
      results = (
        <>
          <p className="bottom-spacing">
            {companyData.companies.length ? 'Showing' : 'No'} results for{' '}
            <code>{searchTerm}</code>
          </p>
          <div className="search-results">
            {companyData.companies.map(renderCompanyResult)}
          </div>
        </>
      );
    }

    return results;
  }

  function renderCompanySearch(): JSX.Element {
    let render = <></>;

    if (!selectedCompany) {
      render = (
        <>
          <form
            className="company-search-form bottom-spacing"
            onSubmit={submitSearch}
          >
            <input
              className="company-search-input"
              type="search"
              placeholder="Search Company Names..."
              value={searchInputValue}
              onChange={onSearchInputChange}
            />
            <button type="submit" disabled={loading}>
              Search
            </button>
          </form>
          {loading && <p>Loading...</p>}
          {!loading && companySearchError && <p>Error!</p>}
          {renderDataResults()}
        </>
      );
    }

    return render;
  }

  return (
    <div className="App">
      {renderCompanySearch()}
      <CompanyGraph
        selectedCompany={selectedCompany}
        setSelectedCompany={setSelectedCompany}
        tradingPartnerCompanies={tradingPartnerCompanies}
        setTradingPartnerCompanies={setTradingPartnerCompanies}
        tradingPartnerEdges={tradingPartnerEdges}
        setTradingPartnerEdges={setTradingPartnerEdges}
        tradingPartnersError={tradingPartnersError}
        setTradingPartnersError={setTradingPartnersError}
        loadedTradingPartners={loadedTradingPartners}
        setLoadedTradingPartners={setLoadedTradingPartners}
      ></CompanyGraph>
    </div>
  );
}

export default App;
