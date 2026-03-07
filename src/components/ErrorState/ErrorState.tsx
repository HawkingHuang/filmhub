import styles from "./ErrorState.module.scss";

type ErrorStateProps = {
  message: string;
};

function ErrorState({ message }: ErrorStateProps) {
  return <div className={styles.state}>{message}</div>;
}

export default ErrorState;
