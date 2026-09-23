import { useState } from 'react'
import { Box, Typography, Select, Option, selectClasses, Input, Button, Modal, ModalDialog, FormControl, FormLabel, Tooltip } from '@mui/joy'
import { FiChevronDown } from 'react-icons/fi'
import { getPropertyByPath } from '../../../functions/dataUtils/propertyByPath'
import camelCaseToTitle from '../../../functions/dataUtils/camelCaseToTitle'
import copyObj from '../../../functions/dataUtils/copyObj'
import {
  createColorScheme,
  deleteColorScheme,
  isValidColorSchemeName,
  renameColorScheme
} from '../../../functions/dataUtils/colorSchemes'

const TOOLTIP_DELAY = 500

function Property({ template, current, path, isThemeColor=false, onChange }) {
  const propertyName = path.slice(path.lastIndexOf('.') + 1)
  const themeTitle = {
    primary: 'Background',
    secondary: 'Text',
    accent: 'Accent'
  }[propertyName]
  const title = themeTitle || camelCaseToTitle(propertyName, !isThemeColor)
  const descriptions = {
    'general.searchEngine': 'Choose the search engine used for regular searches.',
    'general.searchHistory': 'Save regular searches in the local search history.',
    'general.quickRedirect': 'Open destinations immediately instead of waiting for the redirect animation.',
    'general.animationSpeed': 'Set how long Chevron animations take to complete.',
    'general.locale': 'Set the language and country used for suggestions and search requests.',
    'general.tabTitle': 'Set the title shown in the browser tab.',
    'appearance.activeTheme': 'Choose the colorscheme used by Chevron.',
    'chevron.thickness': 'Set the thickness of the Chevron shape.',
    'chevron.size': 'Set the size of the Chevron shape.',
    'chevron.quickLook.marquee': 'Show repeated destination text moving across the quick-look background.',
    'chevron.quickLook.showMacrosLabel': 'Show the macro name in the quick-look label.',
    'query.forceSearchEngineOnCtrl': 'Hold Ctrl while searching to force the selected search engine.',
    'query.notifyAboutForcedSearchEngine': 'Show a notification when Ctrl forces a different search engine.',
    'query.field.fontSize': 'Set the query field text size.',
    'query.field.caret': 'Show the text caret in the query field.',
    'query.suggestions.fontSize': 'Set the suggestion text size.',
    'query.suggestions.autocompleteLimit': 'Set the maximum number of autocomplete suggestions.',
    'query.suggestions.historyLimit': 'Set the maximum number of history suggestions.',
    'menu.rows': 'Set the number of rows in the macro menu.',
    'menu.columns': 'Set the number of columns in the macro menu.',
    'menu.gap': 'Set the spacing between macro menu items.',
    'menu.pagination': 'Split the macro menu into pages when it contains more items than fit.',
    'menu.arrows': 'Show navigation arrows in the macro menu.',
    'menu.drag': 'Allow macro menu items to be rearranged by dragging.',
    'menu.time.fontSize': 'Set the clock text size in the macro menu.',
    'menu.time.format': 'Set the time format shown in the macro menu.',
    primary: 'Set the main background color used throughout Chevron.',
    secondary: 'Set the main text and foreground color used throughout Chevron.',
    accent: 'Set the accent color used for highlights and emphasis.'
  }
  const description = descriptions[path] || descriptions[propertyName] || `Configure ${title.toLowerCase()}.`
  const type = getPropertyByPath(template, path)
  return (
    <Box sx={{
        display: 'flex',
        justifyContent: 'flex-start',
        alignItems: 'center',
        height: '2em'
      }}>
      <Tooltip
        title={description}
        placement='top'
        enterDelay={TOOLTIP_DELAY}
        enterNextDelay={TOOLTIP_DELAY}>
        <Typography level='body1' sx={{mr: 5}}>{title}</Typography>
      </Tooltip>
      <Box sx={{ml: 'auto', display: 'flex'}}>
        <Tooltip
          title={description}
          placement='top'
          enterDelay={TOOLTIP_DELAY}
          enterNextDelay={TOOLTIP_DELAY}>
          <Box sx={{display: 'flex'}}>
            {
              path === 'appearance.activeTheme'
                ? <ThemeSelector current={current} onChange={onChange}/>
                : type.render(
                current,
                path,
                onChange)
            }
          </Box>
        </Tooltip>
      </Box>
    </Box>
  )
}

function ThemeSelector({ current, onChange }) {
  const [dialogMode, setDialogMode] = useState(null)
  const [name, setName] = useState('')
  const themes = current.appearance.themes
  const activeTheme = current.appearance.activeTheme
  const trimmedName = name.trim()
  const canSave = isValidColorSchemeName(
    trimmedName,
    themes,
    dialogMode === 'rename' ? activeTheme : null
  )

  function saveTheme() {
    if (!canSave)
      return

    onChange(previous => {
      if (dialogMode === 'rename') {
        return {
          ...previous,
          appearance: {
            ...previous.appearance,
            themes: renameColorScheme(previous.appearance.themes, activeTheme, trimmedName),
            activeTheme: trimmedName
          }
        }
      } else {
        return {
          ...previous,
          appearance: {
            ...previous.appearance,
            themes: createColorScheme(previous.appearance.themes, trimmedName, themes[activeTheme]),
            activeTheme: trimmedName
          }
        }
      }
    })
    setName('')
    setDialogMode(null)
  }

  function deleteTheme() {
    if (activeTheme === 'default')
      return
    if (!window.confirm(`Delete the "${activeTheme}" colorscheme?`))
      return

    onChange(previous => {
      return {
        ...previous,
        appearance: {
          ...previous.appearance,
          themes: deleteColorScheme(previous.appearance.themes, activeTheme),
          activeTheme: 'default'
        }
      }
    })
  }

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <Select
        size='sm'
        value={activeTheme}
        indicator={<FiChevronDown/>}
        sx={{
          minWidth: 140,
          [`& .${selectClasses.indicator}`]: {
            transition: '0.2s',
            [`&.${selectClasses.expanded}`]: {
              transform: 'rotate(-180deg)'
            }
          }
        }}
        slotProps={{
          listbox: {
            sx: {
              width: 180,
              minWidth: 180,
              maxHeight: 'none',
              overflow: 'visible',
              zIndex: 10000,
              '& > li': {
                whiteSpace: 'nowrap',
                minHeight: '2.25rem',
                display: 'flex',
                alignItems: 'center'
              }
            }
          }
        }}
        onChange={(event, value) => {
          onChange(previous => {
            const next = copyObj(previous)
            next.appearance.activeTheme = value
            return next
          })
        }}>
        {Object.keys(themes).map(theme => (
          <Option key={theme} value={theme}>{theme}</Option>
        ))}
      </Select>
      <Button size='sm' onClick={() => {
        setName('')
        setDialogMode('create')
      }}>
        New
      </Button>
      {activeTheme !== 'default' &&
        <Button size='sm' onClick={() => {
          setName(activeTheme)
          setDialogMode('rename')
        }}>
          Rename
        </Button>}
      {activeTheme !== 'default' &&
        <Button size='sm' color='danger' variant='soft' onClick={deleteTheme}>
          Delete
        </Button>}
      <Modal open={Boolean(dialogMode)} onClose={() => setDialogMode(null)}>
        <ModalDialog>
          <Typography level='h3'>
            {dialogMode === 'rename' ? 'Rename colorscheme' : 'Create colorscheme'}
          </Typography>
          <Box>
            <FormControl>
              <FormLabel>Name</FormLabel>
              <Input
                autoFocus
                value={name}
                error={Boolean(trimmedName) && !canSave}
                onChange={event => setName(event.target.value)}
                onKeyDown={event => {
                  if (event.key === 'Enter' && canSave)
                    saveTheme()
                }}/>
            </FormControl>
            {Boolean(trimmedName) && !canSave &&
              <Typography color='danger' level='body-sm' sx={{mt: 1}}>
                Choose a unique name without periods.
              </Typography>}
          </Box>
          <Box sx={{display: 'flex', justifyContent: 'flex-end', gap: 1}}>
            <Button variant='plain' onClick={() => setDialogMode(null)}>Cancel</Button>
            <Button disabled={!canSave} onClick={saveTheme}>Save</Button>
          </Box>
        </ModalDialog>
      </Modal>
    </Box>
  )
}

export default Property