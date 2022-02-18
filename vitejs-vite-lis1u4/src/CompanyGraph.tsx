import { useState, useEffect, Dispatch, SetStateAction } from 'react';
import HighchartsReact from 'highcharts-react-official';
import Highcharts from 'highcharts';
import networkgraph from 'highcharts/modules/networkgraph';
import { Company } from './App';

type CompanyGraphProps = {
  selectedCompany: Company | null,
  setSelectedCompany: Dispatch<SetStateAction<null>>,
  tradingPartnerCompanies: any[],
  setTradingPartnerCompanies: Dispatch<SetStateAction<any[]>>,
  tradingPartnerEdges: any[],
  setTradingPartnerEdges: Dispatch<SetStateAction<any[]>>,
  tradingPartnersError: any,
  setTradingPartnersError: Dispatch<SetStateAction<null>>,
  loadedTradingPartners: any,
  setLoadedTradingPartners: Dispatch<SetStateAction<null>>
};

function CompanyGraph(props: CompanyGraphProps) {
  const LEVELS_SUPPORTED = 3;

  const {
    selectedCompany,
    setSelectedCompany,
    tradingPartnerCompanies,
    setTradingPartnerCompanies,
    tradingPartnerEdges,
    setTradingPartnerEdges,
    tradingPartnersError,
    setTradingPartnersError,
    loadedTradingPartners,
    setLoadedTradingPartners
  } = props;

  const [graphOptions, setGraphOptions] = useState(null as any);


  
  useEffect(() => {
    if (!selectedCompany || !loadedTradingPartners) {
      setGraphOptions(null);
      return;
    }

    setGraphOptions({
      chart: {
        type: "networkgraph",
        height: "100%"
      },
      tooltip: {
        formatter: function(): string {
          let loadText = '';

          if (this.point.id !== selectedCompany.altana_canon_id
              && !loadedTradingPartners[this.point.id].loaded
              && loadedTradingPartners[this.point.id].level <= LEVELS_SUPPORTED) {
                // Need a zero-width space character between the break tags
                loadText = "<br />​<br />Click to load trading partners.";
          }

          return `${this.point.id}<br />${this.point.name}${loadText}`;
        }
      },
      title: {
        text: '' // `Trading Partners for ${selectedCompany.company_name}`
      },
      plotOptions: {
        networkgraph: {
          layoutAlgorithm: {
            enableSimulation: false
          },
          keys: ['from', 'to'],
          point: {
            events: {
              click(e) {
                onGraphNodeClick(selectedCompany, e.point);
              }
            }
          }
        }
      },
      series: [
        {
          draggable: false,
          dataLabels: {
            enabled: true,
            linkFormat: ""
          },
          nodes: getGraphNodes(selectedCompany, tradingPartnerCompanies),
          data: getGraphEdges(tradingPartnerEdges)
        }
      ]
    });
  }, [loadedTradingPartners, selectedCompany]);

  function getGraphNodes(selectedCompany: Company, companies: Company[]) {
    return [selectedCompany, ...companies].map(company => {
      return {
        id: company.altana_canon_id,
        name: company.company_name,
        marker: {
          radius: company === selectedCompany ? 30 : (loadedTradingPartners[company.altana_canon_id] ? (30 / loadedTradingPartners[company.altana_canon_id].level) : 5)
        },
        color: (company === selectedCompany || loadedTradingPartners[company.altana_canon_id].loaded) ? "#550055" : (loadedTradingPartners[company.altana_canon_id].level > LEVELS_SUPPORTED ? "#554400" : "#0022aa")
      };
    });
  }

  function getGraphEdges(edges: Edge[]) {
    return edges.map(edge => edge.company_canon_ids);
  }

  function onBackToSearchClick(): void {
    setSelectedCompany(null);
    setGraphOptions(null);
    setLoadedTradingPartners(null);
    setTradingPartnerCompanies([]);
    setTradingPartnerEdges([]);
    setTradingPartnersError(null);
  }

  function onGraphNodeClick(selectedCompany: Company, point): void {
    const clickedCompanyId = point.id;

    if (clickedCompanyId !== selectedCompany.altana_canon_id
        && !loadedTradingPartners[clickedCompanyId].loaded
        && loadedTradingPartners[clickedCompanyId].level <= LEVELS_SUPPORTED) {

      setLoadedTradingPartners(input => ({
        ...input,
        [clickedCompanyId]: {
          ...input[clickedCompanyId],
          loaded: true
        }
      }));

      fetch(`https://api.altana.ai/atlas/v1/company/id/${encodeURIComponent(clickedCompanyId)}/trading-partners`, {
        method: "GET",
        headers: {
          "accept": "application/json",
          "X-Api-Key": "MTpJbnRlcnZpZXclMjAyMDIxLTA5LTIyOjE2MzIzNTk2NTU6NWNhMzViYjk.ZmEwZWI5OTdmYWJjYWFlZWJmY2YyNGYyN2FkMmQ5YzkwODQ4NWNiYg"
        }
      }).then(response => {
        if (response.ok) {
          return response.json();
        } else {
          throw response; 
        }
      })
      .then(searchResults => {
        setTradingPartnerCompanies([
          ...tradingPartnerCompanies,
          ...searchResults.companies
        ]);
        setTradingPartnerEdges([
          ...tradingPartnerEdges,
          ...searchResults.edges
        ]);
        setLoadedTradingPartners(input => {
          const newValue = input ? {...input} : {};
          const currentLevel = newValue[clickedCompanyId] ? newValue[clickedCompanyId].level : 1;
          
          searchResults.companies.forEach(company => {
            if (!newValue[company.altana_canon_id]) {
              newValue[company.altana_canon_id] = {
                level: currentLevel + 1,
                name: company.company_name,
                loaded: false
              };
            }
          });

          return newValue;
        });
      })
      .catch(searchError => {
        console.error(searchError);
        setTradingPartnersError(searchError);
      });
    }
  }


  let render = <></>;

  if (selectedCompany) {
    networkgraph(Highcharts);

    render = (
      <>
        <button
          type="button"
          className="bottom-spacing"
          onClick={onBackToSearchClick}
        >
          &lt; Back to Search
        </button>
        <p className="bottom-spacing">
          Showing trading partners for {selectedCompany.company_name}
        </p>
        {selectedCompany && !graphOptions && !tradingPartnersError && (
          <p>Loading...</p>
        )}
        {tradingPartnersError && <p>Error!</p>}
        {graphOptions && (
          <div className="graph">
            <HighchartsReact highcharts={Highcharts} options={graphOptions} />
          </div>
        )}
      </>
    );
  }

  return render;
}

export default CompanyGraph;
