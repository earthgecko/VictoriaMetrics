import React, { FC, useEffect, useRef, useState } from "preact/compat";
import { useTimeDispatch } from "../../../../state/time/TimeStateContext";
import { getAppModeEnable } from "../../../../utils/app-mode";
import Button from "../../../Main/Button/Button";
import { ArrowDownIcon, RefreshIcon } from "../../../Main/Icons";
import Popper from "../../../Main/Popper/Popper";
import "./style.scss";
import classNames from "classnames";
import Tooltip from "../../../Main/Tooltip/Tooltip";
import useResize from "../../../../hooks/useResize";

interface AutoRefreshOption {
  seconds: number
  title: string
}

const delayOptions: AutoRefreshOption[] = [
  { seconds: 0, title: "Off" },
  { seconds: 1, title: "1s" },
  { seconds: 2, title: "2s" },
  { seconds: 5, title: "5s" },
  { seconds: 10, title: "10s" },
  { seconds: 30, title: "30s" },
  { seconds: 60, title: "1m" },
  { seconds: 300, title: "5m" },
  { seconds: 900, title: "15m" },
  { seconds: 1800, title: "30m" },
  { seconds: 3600, title: "1h" },
  { seconds: 7200, title: "2h" }
];

export const ExecutionControls: FC = () => {
  const windowSize = useResize(document.body);

  const dispatch = useTimeDispatch();
  const appModeEnable = getAppModeEnable();
  const [autoRefresh, setAutoRefresh] = useState(false);

  const [selectedDelay, setSelectedDelay] = useState<AutoRefreshOption>(delayOptions[0]);

  const handleChange = (d: AutoRefreshOption) => {
    if ((autoRefresh && !d.seconds) || (!autoRefresh && d.seconds)) {
      setAutoRefresh(prev => !prev);
    }
    setSelectedDelay(d);
    setOpenOptions(false);
  };

  const handleUpdate = () => {
    dispatch({ type: "RUN_QUERY" });
  };

  useEffect(() => {
    const delay = selectedDelay.seconds;
    let timer: number;
    if (autoRefresh) {
      timer = setInterval(() => {
        dispatch({ type: "RUN_QUERY" });
      }, delay * 1000) as unknown as number;
    } else {
      setSelectedDelay(delayOptions[0]);
    }
    return () => {
      timer && clearInterval(timer);
    };
  }, [selectedDelay, autoRefresh]);

  const [openOptions, setOpenOptions] = useState(false);
  const optionsButtonRef = useRef<HTMLDivElement>(null);

  const toggleOpenOptions = () => {
    setOpenOptions(prev => !prev);
  };

  const handleCloseOptions = () => {
    setOpenOptions(false);
  };

  const createHandlerChange = (d: AutoRefreshOption) => () => {
    handleChange(d);
  };

  return <>
    <div className="vm-execution-controls">
      <div
        className={classNames({
          "vm-execution-controls-buttons": true,
          "vm-header-button": !appModeEnable,
          "vm-execution-controls-buttons_short": windowSize.width <= 360
        })}
      >
        {windowSize.width > 360 && (
          <Tooltip title="Refresh dashboard">
            <Button
              variant="contained"
              color="primary"
              onClick={handleUpdate}
              startIcon={<RefreshIcon/>}
            />
          </Tooltip>
        )}
        <Tooltip title="Auto-refresh control">
          <div ref={optionsButtonRef}>
            <Button
              variant="contained"
              color="primary"
              fullWidth
              endIcon={(
                <div
                  className={classNames({
                    "vm-execution-controls-buttons__arrow": true,
                    "vm-execution-controls-buttons__arrow_open": openOptions,
                  })}
                >
                  <ArrowDownIcon/>
                </div>
              )}
              onClick={toggleOpenOptions}
            >
              {selectedDelay.title}
            </Button>
          </div>
        </Tooltip>
      </div>
    </div>
    <Popper
      open={openOptions}
      placement="bottom-right"
      onClose={handleCloseOptions}
      buttonRef={optionsButtonRef}
    >
      <div className="vm-execution-controls-list">
        {delayOptions.map(d => (
          <div
            className={classNames({
              "vm-list-item": true,
              "vm-list-item_active": d.seconds === selectedDelay.seconds
            })}
            key={d.seconds}
            onClick={createHandlerChange(d)}
          >
            {d.title}
          </div>
        ))}
      </div>
    </Popper>
  </>;
};
