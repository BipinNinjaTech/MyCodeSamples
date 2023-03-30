import React, { useState, useEffect } from "react";
import { useSelector, useDispatch, shallowEqual } from "react-redux";
import { RootState } from "../../reducers";
import { AppDataActions } from "../../actions";
import FilterOptionSelector from "./FilterOptionSelector";
import { Button } from "dunnhumby-component-library";
import { FilterDialogLabel, FilterDialogToggles } from "./FilterDialogContent";
import { FilterDialogState } from "./types";
import { AppDataService } from "../../services";
import { DeleteDialog } from "./DeleteDialog";

function FiterDialog(props) {
  const { businessAttributes } = useSelector(
    (state: RootState) => state.app,
    shallowEqual
  );
  const dispatch = useDispatch();
  const { queryFilterType, onAdd, setShowCloseFilterDialog,  } = props;
  const showBusiness =
    businessAttributes.some(
      (attr) => attr.value === queryFilterType?.attribute
    ) || !queryFilterType.attribute;
  const initialState: FilterDialogState = {
    id:
      queryFilterType?.id === 0
        ? Math.round(new Date().getTime() / 1000)
        : queryFilterType.id,
    attribute: queryFilterType.attribute,
    groupby: queryFilterType.groupby,
    filtertype: queryFilterType.filtertype,
    filtervalues: queryFilterType.filtervalues,
    // tslint:disable-next-line: quotemark
    searchString: queryFilterType.search_string
      ? queryFilterType.search_string
      : "",
    showBusinessNames: showBusiness,
    isCustomName: queryFilterType?.filtervalues?.some((e) => {
      return e?.name !== e?.value;
    })
      ? true
      : false,
    isCustomImported: false,
    filterDisable: queryFilterType.filterDisable || false,
    temporal_value: queryFilterType.temporal_value,
  };

  const [filterState, setFilterState] = useState(initialState);
  const [showDeleteFilterDialog, setShowDeleteFilterDialog] = useState(false);

  useEffect(() => {
    const { filtertype, isCustomName } = filterState;
    dispatch(
      AppDataActions.setCustomName(filtertype == "filter_incl" && isCustomName)
    );
  }, [filterState.isCustomName]);

  useEffect(() => {
    let { filtertype, filtervalues: filterOptionsClone } = filterState;
    if (filtertype === "filter_excl") {
      filterOptionsClone = filterOptionsClone.map((item) => {
        return { ...item, value: item.name };
      });
      setFilterState({ ...filterState, filtervalues: filterOptionsClone, isCustomName: false});
    }
  }, [filterState.filtertype]);

  const handelToggle = (name: string, value: any) => {
    setFilterState({ ...filterState, [name]: value });
  };

  const IsCustImported = (isCustomImported) => {
    setFilterState({ ...filterState, isCustomName: isCustomImported });
  };

  const getFinalFiltersValue = () => {
    const { filtervalues, isCustomName } = filterState;
    let filterOptionsClone = filtervalues;
    if (!isCustomName) {
      filterOptionsClone = filterOptionsClone.map((item) => {
        return { ...item, value: item.name };
      });
      return filterOptionsClone;
    }
    return filterOptionsClone;
  };

  const renderFilterOptionSelector = () => {
    const {
      attribute,
      showBusinessNames,
      filtervalues,
      searchString,
      filterDisable,
    } = filterState;
    return (
      <FilterOptionSelector
        selectedFilterOptions={filtervalues}
        attr={{ state: attribute, prop: queryFilterType.attribute, temporal_value: queryFilterType.temporal_value }}
        showBusinessNames={showBusinessNames}
        onAttributeChange={(attr, isBusiness) => {
          setFilterState({
            ...filterState,
            showBusinessNames: isBusiness,
            attribute: attr,
          });
        }}
        setFilterOptions={(filterOptions) =>
          setFilterState({ ...filterState, filtervalues: filterOptions , filtertype: filterOptions.length >= 1 && filterState.filtertype !== 'filter_excl' ? 'filter_incl': filterState.filtertype})
        }
        searchString={searchString}
        setSearchString={(searchString: string) =>
          setFilterState({ ...filterState, searchString: searchString })
        }
        IsCustImported={IsCustImported}
        filterDisable={filterDisable}
      />
    );
  };

  const {
    attribute,
    filtertype,
    groupby,
    isCustomImported,
    isCustomName,
    searchString,
    id,
  } = filterState;

  return (
    <section>
      <div>
        <div className="row">
          <div className="col-md-12">
            <FilterDialogLabel label="Filter By" />
            <div className="filterDialogSection">
              <div
                className="row"
                style={{ paddingTop: "5px", paddingBottom: "0px" }}
              >
                 <div className="d-inline-block col-md-6 "></div>
                <FilterDialogToggles
                  filtertype={filterState.filtertype}
                  isCustomImported={isCustomImported}
                  isCustomName={isCustomName}
                  onChange={handelToggle}
                  filterState={filterState}
                />
              </div>
              <div className={"row align-items-center justify-content-center"}>
                {renderFilterOptionSelector()}
              </div>
            </div>
          </div>
        </div>
        <div className="row">
          <div className="col-12 text-right">
            <span
              className="clearFilter"
              onClick={() => setShowDeleteFilterDialog(true)}
            >
              {" "}
              Clear Filters
            </span>
            {showDeleteFilterDialog && (
              <DeleteDialog
                content={
                  <p>Are you sure you want to clear your selected filters?</p>
                }
                clearFilters={(clear: boolean) => {
                  if (clear) {
                    setFilterState({ ...filterState, filtervalues: [], filterDisable: false });
                  }
                  setShowDeleteFilterDialog(false);
                }}
                showDeleteFilterDialog={showDeleteFilterDialog}
                onHide={() => {
                  setShowDeleteFilterDialog(false);
                }}
              />
            )}
            <Button
              classes="btn btn-secondary"
              value="Cancel"
              type="button"
              onClick={async () => {
                await new AppDataService().cancelAPIRequest();
                onAdd(
                  queryFilterType.id > 0 ? id : null,
                  {
                    id: 0,
                    attribute: "",
                    groupby: "No",
                    filtertype: "no_filter",
                    filtervalues: [],
                    search_string: "",
                    filterDisable: false,
                  },
                  true
                );
                {
                  renderFilterOptionSelector();
                }
                setShowCloseFilterDialog();
              }}
            />
            <Button
              classes="btn btn-primary"
              value="Ok"
              type="button"
              onClick={() => {
                let payload:any = {
                  id: queryFilterType.id > 0 ? queryFilterType.id : id,
                  attribute: attribute,
                  groupby: groupby,
                  filtertype: filtertype,
                  filtervalues: getFinalFiltersValue(),
                  search_string: searchString,
                  filterDisable: filterState.filterDisable,
                  index: queryFilterType.index
                }
                if(filterState.temporal_value){
                  payload = {...payload, temporal_value: filterState.temporal_value
                    ? filterState.temporal_value
                    : null
                  }
                }
                onAdd(
                  queryFilterType.id > 0 ? queryFilterType.id : null,
                  payload,
                  false
                );
              }}
              disabled={!attribute}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

export default FiterDialog;
