import { Facebook, Instagram } from '@styled-icons/boxicons-logos'
import { Search as SearchIcon } from '@styled-icons/boxicons-regular'
import React from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components/macro'

import harvestData from '../../constants/data/harvest.json'
import X from '../../constants/X.svg'
import { theme } from '../ui/GlobalStyle'
import Input from '../ui/Input'
import DataTable from './DataTable'

const TablePreviewLink = styled.a`
  display: inline-flex;
  align-items: center;
  height: 20px;
  width: 20px;
  margin-inline-end: 5px;

  img {
    width: 100%;
    height: auto;
    margin: 0;
  }
`

const OrganizationName = styled.span`
  ${({ $isActive }) =>
    !$isActive &&
    `
  opacity: 0.5;
`}
`

// TODO: Consider updating organization name formatting
const FormattedOrganization = ({
  name,
  name_url,
  subname,
  subname_url,
  active,
}) => (
  <OrganizationName $isActive={active}>
    {name_url ? (
      <a href={name_url} target="_blank" rel="noreferrer">
        {name}
      </a>
    ) : (
      name
    )}
    {subname && ' > '}
    {subname &&
      (subname_url ? (
        <a href={subname_url} target="_blank" rel="noreferrer">
          {subname}
        </a>
      ) : (
        <>{subname}</>
      ))}
  </OrganizationName>
)

const FormattedSocials = ({ facebook, instagram, x }) => {
  if (!facebook && !instagram && !x) {
    return null
  }
  return (
    <>
      {facebook && (
        <TablePreviewLink href={facebook} target="_blank" rel="noreferrer">
          <Facebook color={theme.text} />
        </TablePreviewLink>
      )}
      {instagram && (
        <TablePreviewLink href={instagram} target="_blank" rel="noreferrer">
          <Instagram color={theme.text} />
        </TablePreviewLink>
      )}
      {x && (
        <TablePreviewLink href={x} target="_blank" rel="noreferrer">
          <img src={X} alt={`X logo`} />
        </TablePreviewLink>
      )}
    </>
  )
}

const ShareTheHarvestTable = () => {
  const [filterText, setFilterText] = React.useState('')
  // Remembered sort so we can restore it after remounting on a language change
  // (the table is keyed on the language to re-sort with the new collator).
  const [sort, setSort] = React.useState({ id: 'country', asc: true })
  const { t, i18n } = useTranslation()

  // Sort text columns using the active locale's alphabet (e.g. Czech orders
  // diacritics inline and "ch" after "h") instead of default code-point order.
  const collator = new Intl.Collator(i18n.language, { numeric: true })
  const localeSort = (selector) => (rowA, rowB) =>
    collator.compare(String(selector(rowA)), String(selector(rowB)))

  const translatedCountries = {
    Australia: t('pages.sharing.countries.australia'),
    Belgium: t('pages.sharing.countries.belgium'),
    Brazil: t('pages.sharing.countries.brazil'),
    Canada: t('pages.sharing.countries.canada'),
    Chile: t('pages.sharing.countries.chile'),
    Czechia: t('pages.sharing.countries.czechia'),
    Fiji: t('pages.sharing.countries.fiji'),
    Finland: t('pages.sharing.countries.finland'),
    France: t('pages.sharing.countries.france'),
    Germany: t('pages.sharing.countries.germany'),
    Greece: t('pages.sharing.countries.greece'),
    Ireland: t('pages.sharing.countries.ireland'),
    Italy: t('pages.sharing.countries.italy'),
    'New Zealand': t('pages.sharing.countries.new_zealand'),
    Portugal: t('pages.sharing.countries.portugal'),
    Poland: t('pages.sharing.countries.poland'),
    Spain: t('pages.sharing.countries.spain'),
    Sweden: t('pages.sharing.countries.sweden'),
    Switzerland: t('pages.sharing.countries.switzerland'),
    'United Kingdom': t('pages.sharing.countries.united_kingdom'),
    'United States': t('pages.sharing.countries.united_states'),
  }

  const countrySelector = (row) =>
    translatedCountries[row.country] || row.country || '-'
  const stateSelector = (row) => row.state ?? '-'
  const citySelector = (row) => row.city ?? '-'
  const nameSelector = (row) => row.name

  const columns = [
    {
      id: 'country',
      name: t('pages.sharing.heading.country'),
      selector: countrySelector,
      sortable: true,
      sortFunction: localeSort(countrySelector),
      wrap: true,
    },
    {
      id: 'state',
      name: t('pages.sharing.heading.state'),
      selector: stateSelector,
      sortable: true,
      sortFunction: localeSort(stateSelector),
      wrap: true,
    },
    {
      id: 'city',
      name: t('pages.sharing.heading.city'),
      selector: citySelector,
      sortable: true,
      sortFunction: localeSort(citySelector),
      wrap: true,
    },
    {
      id: 'name',
      name: t('glossary.name'),
      selector: nameSelector,
      sortable: true,
      sortFunction: localeSort(nameSelector),
      grow: 2.5,
      format: FormattedOrganization,
      wrap: true,
    },
    {
      id: 'social',
      name: t('pages.sharing.heading.social'),
      selector: (row) => row.facebook || row.instagram || row.x,
      format: FormattedSocials,
      compact: true,
      width: '80px',
      right: true,
    },
  ]

  const filteredData = harvestData.filter((item) => {
    const query = filterText.toLowerCase()
    const translatedCountry = translatedCountries[item.country] || item.country
    const keywords = [translatedCountry, item.state, item.city, item.name]
    return keywords.some(
      (keyword) =>
        keyword && keyword.toLowerCase && keyword.toLowerCase().includes(query),
    )
  })

  return (
    <DataTable
      // Remount on language change so the columns re-sort with the new locale's
      // collator; the remembered sort and filter text are restored below.
      key={i18n.language}
      columns={columns}
      data={filteredData}
      defaultSortFieldId={sort.id}
      defaultSortAsc={sort.asc}
      onSort={(column, sortDirection) =>
        setSort({ id: column.id, asc: sortDirection === 'asc' })
      }
      subHeader
      subHeaderComponent={
        <Input
          placeholder={t('form.search')}
          icon={<SearchIcon />}
          value={filterText}
          onChange={(e) => setFilterText(e.target.value)}
          name="search"
        />
      }
      persistTableHead
    />
  )
}

export default ShareTheHarvestTable
