import Head from 'next/head';
import { useRouter } from 'next/router';
import { useState, type FormEvent } from 'react';
import type { GetServerSideProps, InferGetServerSidePropsType } from 'next';

import { Footer } from '../components/Footer';
import { Header } from '../components/Header';
import { Reveal } from '../components/Reveal';
import {
  isDashboardAuthConfigured,
  isDashboardRequestAuthenticated,
} from '../lib/dashboardAuth';
import {
  getDashboardSnapshot,
  type DashboardSnapshot,
} from '../lib/dashboardStore';
import styles from '../styles/Dashboard.module.scss';

function formatDate(dateValue: string) {
  return new Intl.DateTimeFormat('en-GB', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(dateValue));
}

function shortenVisitorId(visitorId: string) {
  if (visitorId.length <= 18) {
    return visitorId;
  }

  return `${visitorId.slice(0, 8)}...${visitorId.slice(-4)}`;
}

function getSafeContactErrorMessage(errorMessage: string | null) {
  if (!errorMessage) {
    return null;
  }

  return 'Message delivery failed.';
}

interface DashboardPageProps extends DashboardSnapshot {
  isAuthenticated: boolean;
  isConfigured: boolean;
}

const emptyDashboardSnapshot: DashboardSnapshot = {
  metrics: {
    totalVisits: 0,
    uniqueVisitors: 0,
    totalContactAttempts: 0,
    successfulContacts: 0,
  },
  visitors: [],
  contactAttempts: [],
};

export const getServerSideProps: GetServerSideProps<DashboardPageProps> = async (context) => {
  const isConfigured = isDashboardAuthConfigured();
  const isAuthenticated = isConfigured && isDashboardRequestAuthenticated(context);

  if (!isAuthenticated) {
    return {
      props: {
        ...emptyDashboardSnapshot,
        isAuthenticated: false,
        isConfigured,
      },
    };
  }

  return {
    props: {
      ...(await getDashboardSnapshot()),
      isAuthenticated: true,
      isConfigured: true,
    },
  };
};

export default function DashboardPage({
  isAuthenticated,
  isConfigured,
  metrics,
  visitors,
  contactAttempts,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  async function handleLoginSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    setAuthError('');
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/dashboard/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      });

      const responseData = (await response.json().catch(() => null)) as { message?: string } | null;

      if (!response.ok) {
        throw new Error(responseData?.message ?? 'Could not authenticate.');
      }

      await router.replace(router.asPath);
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : 'Could not authenticate.');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleLogout() {
    if (isLoggingOut) {
      return;
    }

    setIsLoggingOut(true);

    try {
      await fetch('/api/dashboard/logout', {
        method: 'POST',
      });
    } finally {
      await router.replace('/dashboard');
      setIsLoggingOut(false);
    }
  }

  return (
    <>
      <Head>
        <title>{isAuthenticated ? 'Dashboard' : 'Dashboard Login'} | Dev Oliveira</title>
        <meta
          name="description"
          content="Dashboard with site visits and contact attempts."
        />
      </Head>

      <div className={styles.page}>
        <div className={styles.container}>
          <Header />

          <main className={styles.main}>
            {!isAuthenticated ? (
              <Reveal animateIn="animate__fadeInUp">
                <section className={styles.authSection}>
                  <article className={styles.authCard}>
                    <div>
                      <p className={styles.eyebrow}>Protected dashboard</p>
                      <h1>Sign in with your dashboard password.</h1>
                      <p className={styles.description}>
                        {isConfigured
                          ? 'Use your single admin password to access visitors and contact attempts.'
                          : 'Add DASHBOARD_PASSWORD to your environment variables before using the dashboard login.'}
                      </p>
                    </div>
                    {isConfigured && (
                      <form className={styles.authForm} onSubmit={handleLoginSubmit}>
                        <label className={styles.field}>
                          <span>Password</span>
                          <input
                            type="password"
                            name="password"
                            value={password}
                            onChange={(event) => setPassword(event.target.value)}
                            autoComplete="current-password"
                            placeholder="Enter your dashboard password"
                            disabled={isSubmitting}
                            required
                          />
                        </label>

                        {authError && <p className={styles.authError}>{authError}</p>}

                        <button className={styles.authButton} type="submit" disabled={isSubmitting}>
                          {isSubmitting ? 'Signing in...' : 'Sign in'}
                        </button>
                      </form>
                    )}
                  </article>
                </section>
              </Reveal>
            ) : (
              <>
                <Reveal animateIn="animate__fadeInUp">
                  <section className={styles.hero}>
                    <div>
                      <p className={styles.eyebrow}>Dashboard</p>
                      <h1>Track visitors and contact attempts.</h1>
                      <p className={styles.description}>
                        This view keeps development simple for now while exposing the
                        data you asked for in one place.
                      </p>
                    </div>
                    <button
                      className={styles.logoutButton}
                      type="button"
                      onClick={handleLogout}
                      disabled={isLoggingOut}
                    >
                      {isLoggingOut ? 'Signing out...' : 'Sign out'}
                    </button>
                  </section>
                </Reveal>

                <section className={styles.metricsGrid} aria-label="Dashboard metrics">
                  <Reveal delay={100} animateIn="animate__fadeInUp">
                    <article className={styles.metricCard}>
                      <span>Total visits</span>
                      <strong>{metrics.totalVisits}</strong>
                      <p>Every tracked page visit recorded in the database.</p>
                    </article>
                  </Reveal>

                  <Reveal delay={200} animateIn="animate__fadeInUp">
                    <article className={styles.metricCard}>
                      <span>Unique visitors</span>
                      <strong>{metrics.uniqueVisitors}</strong>
                      <p>Approximate visitors grouped by browser identifier.</p>
                    </article>
                  </Reveal>

                  <Reveal delay={300} animateIn="animate__fadeInUp">
                    <article className={styles.metricCard}>
                      <span>Contact attempts</span>
                      <strong>{metrics.totalContactAttempts}</strong>
                      <p>Messages submitted through the Contact Me modal.</p>
                    </article>
                  </Reveal>

                  <Reveal delay={400} animateIn="animate__fadeInUp">
                    <article className={styles.metricCard}>
                      <span>Delivered messages</span>
                      <strong>{metrics.successfulContacts}</strong>
                      <p>Attempts successfully sent through the email service.</p>
                    </article>
                  </Reveal>
                </section>

                <section className={styles.contentGrid}>
                  <Reveal delay={200} animateIn="animate__fadeInUp">
                    <article className={styles.panel}>
                      <div className={styles.panelHeader}>
                        <div>
                          <p className={styles.panelEyebrow}>Visitors</p>
                          <h2>Who visited the site</h2>
                        </div>
                        <span>{visitors.length} tracked</span>
                      </div>

                      {visitors.length === 0 ? (
                        <p className={styles.emptyState}>
                          No visitors have been tracked yet.
                        </p>
                      ) : (
                        <div className={styles.visitorList}>
                          {visitors.map((visitor) => (
                            <article key={visitor.visitorId} className={styles.visitorCard}>
                              <div className={styles.visitorTopRow}>
                                <strong>{shortenVisitorId(visitor.visitorId)}</strong>
                                <span>{visitor.totalVisits} visits</span>
                              </div>

                              <dl className={styles.metaList}>
                                <div>
                                  <dt>First seen</dt>
                                  <dd>{formatDate(visitor.firstSeenAt)}</dd>
                                </div>
                                <div>
                                  <dt>Last seen</dt>
                                  <dd>{formatDate(visitor.lastSeenAt)}</dd>
                                </div>
                                <div>
                                  <dt>Last path</dt>
                                  <dd>{visitor.lastPath}</dd>
                                </div>
                                <div>
                                  <dt>IP</dt>
                                  <dd>{visitor.ip ?? 'Unavailable'}</dd>
                                </div>
                              </dl>

                              <p className={styles.userAgent}>
                                {visitor.userAgent ?? 'User agent unavailable.'}
                              </p>
                            </article>
                          ))}
                        </div>
                      )}
                    </article>
                  </Reveal>

                  <Reveal delay={300} animateIn="animate__fadeInUp">
                    <article className={styles.panel}>
                      <div className={styles.panelHeader}>
                        <div>
                          <p className={styles.panelEyebrow}>Messages</p>
                          <h2>Contact Me submissions</h2>
                        </div>
                        <span>{contactAttempts.length} recorded</span>
                      </div>

                      {contactAttempts.length === 0 ? (
                        <p className={styles.emptyState}>
                          No contact attempts have been recorded yet.
                        </p>
                      ) : (
                        <div className={styles.messageList}>
                          {contactAttempts.map((attempt) => (
                            <article key={attempt.id} className={styles.messageCard}>
                              <div className={styles.messageHeader}>
                                <div>
                                  <h3>{attempt.name}</h3>
                                  <p>{attempt.email}</p>
                                </div>
                                <span
                                  className={`${styles.statusBadge} ${
                                    attempt.status === 'sent' ? styles.statusSent : styles.statusFailed
                                  }`}
                                >
                                  {attempt.status}
                                </span>
                              </div>

                              <p className={styles.messageContent}>{attempt.message}</p>

                              <dl className={styles.metaList}>
                                <div>
                                  <dt>Submitted</dt>
                                  <dd>{formatDate(attempt.submittedAt)}</dd>
                                </div>
                                <div>
                                  <dt>IP</dt>
                                  <dd>{attempt.ip ?? 'Unavailable'}</dd>
                                </div>
                              </dl>

                              {getSafeContactErrorMessage(attempt.errorMessage) && (
                                <p className={styles.errorText}>
                                  {getSafeContactErrorMessage(attempt.errorMessage)}
                                </p>
                              )}
                            </article>
                          ))}
                        </div>
                      )}
                    </article>
                  </Reveal>
                </section>
              </>
            )}
          </main>
        </div>

        <Footer />
      </div>
    </>
  );
}
