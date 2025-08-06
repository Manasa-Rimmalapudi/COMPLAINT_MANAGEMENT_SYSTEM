
import React from 'react';
import Layout from '../components/Layout';
import Analytics from '../components/Analytics';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { ArrowLeft, Download, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTickets } from '../hooks/useTickets';
import { useAuth } from '../hooks/useAuth';

const AdminAnalytics: React.FC = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { tickets, isLoading } = useTickets();

  console.log('AdminAnalytics - profile:', profile, 'tickets:', tickets.length);

  // Ensure only admin can access
  if (profile?.role !== 'admin') {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
            <p className="text-muted-foreground">You don't have permission to access this page.</p>
          </div>
        </div>
      </Layout>
    );
  }

  const handleExportData = () => {
    // Mock export functionality
    console.log('Exporting analytics data...');
    alert('Analytics data exported successfully!');
  };

  const handleRefreshData = () => {
    // Mock refresh functionality
    console.log('Refreshing analytics data...');
    window.location.reload();
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-96">
          <div className="animate-pulse text-primary">Loading analytics data...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center space-x-4">
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => navigate('/admin/dashboard')}
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
              <p className="text-muted-foreground">Comprehensive insights and performance metrics</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Button 
              variant="outline" 
              onClick={handleRefreshData}
              className="flex items-center space-x-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Refresh</span>
            </Button>
            <Button 
              onClick={handleExportData}
              className="flex items-center space-x-2"
            >
              <Download className="w-4 h-4" />
              <span>Export</span>
            </Button>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">System Performance</CardTitle>
              <CardDescription>Overall system health and performance indicators</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Uptime</span>
                  <span className="text-sm font-medium text-green-500">99.9%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Response Time</span>
                  <span className="text-sm font-medium">1.2s</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">AI Accuracy</span>
                  <span className="text-sm font-medium text-primary">94.3%</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Team Performance</CardTitle>
              <CardDescription>Support team productivity and efficiency</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Active Agents</span>
                  <span className="text-sm font-medium">12</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Avg Handle Time</span>
                  <span className="text-sm font-medium">18m</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Satisfaction</span>
                  <span className="text-sm font-medium text-yellow-500">4.7/5</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">AI Insights</CardTitle>
              <CardDescription>Machine learning powered recommendations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Auto-Resolved</span>
                  <span className="text-sm font-medium text-purple-500">23%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Predictions</span>
                  <span className="text-sm font-medium">87% accuracy</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Suggestions</span>
                  <span className="text-sm font-medium text-orange-500">156 today</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Analytics Component */}
        <Analytics tickets={tickets} />

        {/* Additional Insights */}
        <Card>
          <CardHeader>
            <CardTitle>AI-Powered Insights</CardTitle>
            <CardDescription>Machine learning recommendations based on ticket patterns</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-semibold text-primary">Trending Issues</h4>
                <div className="space-y-2">
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <p className="text-sm font-medium">Billing payment failures</p>
                    <p className="text-xs text-muted-foreground">+23% this week</p>
                  </div>
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <p className="text-sm font-medium">Mobile app login issues</p>
                    <p className="text-xs text-muted-foreground">+18% this week</p>
                  </div>
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <p className="text-sm font-medium">Service quality complaints</p>
                    <p className="text-xs text-muted-foreground">+12% this week</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold text-purple-500">Recommendations</h4>
                <div className="space-y-2">
                  <div className="p-3 bg-purple-100 rounded-lg border-l-4 border-purple-500">
                    <p className="text-sm font-medium">Optimize billing team capacity</p>
                    <p className="text-xs text-muted-foreground">Consider adding 2 more agents during peak hours</p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-lg border-l-4 border-blue-500">
                    <p className="text-sm font-medium">Update mobile app documentation</p>
                    <p className="text-xs text-muted-foreground">Create FAQ for common login issues</p>
                  </div>
                  <div className="p-3 bg-yellow-100 rounded-lg border-l-4 border-yellow-500">
                    <p className="text-sm font-medium">Implement proactive outreach</p>
                    <p className="text-xs text-muted-foreground">Follow up on resolved service complaints</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default AdminAnalytics;
