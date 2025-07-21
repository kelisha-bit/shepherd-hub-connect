import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, ScrollView, Dimensions, ActivityIndicator } from 'react-native';
import { supabase } from '../../supabaseClient';
import { LineChart, BarChart } from 'react-native-chart-kit';

const screenWidth = Dimensions.get('window').width - 32;

export default function AnalyticsScreen() {
  const [attendanceData, setAttendanceData] = useState(null);
  const [donationData, setDonationData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      // Attendance trends
      const { data: attendance } = await supabase
        .from('attendance')
        .select('attendance_date, present')
        .order('attendance_date', { ascending: true });
      // Donations trends
      const { data: donations } = await supabase
        .from('donations')
        .select('donation_date, amount')
        .order('donation_date', { ascending: true });
      // Process attendance by month
      const attendanceByMonth = {};
      (attendance || []).forEach(a => {
        const month = a.attendance_date?.slice(0, 7); // YYYY-MM
        if (!month) return;
        if (!attendanceByMonth[month]) attendanceByMonth[month] = 0;
        if (a.present) attendanceByMonth[month] += 1;
      });
      const attendanceLabels = Object.keys(attendanceByMonth);
      const attendanceCounts = attendanceLabels.map(m => attendanceByMonth[m]);
      setAttendanceData({ labels: attendanceLabels, data: attendanceCounts });
      // Process donations by month
      const donationsByMonth = {};
      (donations || []).forEach(d => {
        const month = d.donation_date?.slice(0, 7); // YYYY-MM
        if (!month) return;
        if (!donationsByMonth[month]) donationsByMonth[month] = 0;
        donationsByMonth[month] += d.amount || 0;
      });
      const donationLabels = Object.keys(donationsByMonth);
      const donationTotals = donationLabels.map(m => donationsByMonth[m]);
      setDonationData({ labels: donationLabels, data: donationTotals });
      setLoading(false);
    };
    fetchAnalytics();
  }, []);

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 32 }}>
      <Text style={styles.title}>Analytics</Text>
      {loading ? <ActivityIndicator size="large" color="#007AFF" /> : (
        <>
          <Text style={styles.chartTitle}>Attendance Trends</Text>
          {attendanceData && attendanceData.labels.length > 0 ? (
            <BarChart
              data={{
                labels: attendanceData.labels,
                datasets: [{ data: attendanceData.data }],
              }}
              width={screenWidth}
              height={220}
              yAxisLabel=""
              chartConfig={chartConfig}
              style={styles.chart}
            />
          ) : <Text style={styles.emptyText}>No attendance data.</Text>}
          <Text style={styles.chartTitle}>Donations Over Time</Text>
          {donationData && donationData.labels.length > 0 ? (
            <LineChart
              data={{
                labels: donationData.labels,
                datasets: [{ data: donationData.data }],
              }}
              width={screenWidth}
              height={220}
              yAxisLabel="$"
              chartConfig={chartConfig}
              style={styles.chart}
            />
          ) : <Text style={styles.emptyText}>No donation data.</Text>}
        </>
      )}
    </ScrollView>
  );
}

const chartConfig = {
  backgroundGradientFrom: '#fff',
  backgroundGradientTo: '#fff',
  color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(0,0,0,${opacity})`,
  strokeWidth: 2,
  barPercentage: 0.7,
  decimalPlaces: 0,
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f6f8fa',
    paddingTop: 50,
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 24,
    marginBottom: 8,
    textAlign: 'center',
  },
  chart: {
    borderRadius: 12,
    marginBottom: 16,
  },
  emptyText: {
    textAlign: 'center',
    color: '#888',
    marginBottom: 16,
  },
}); 